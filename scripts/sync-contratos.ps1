# Le a planilha Contratos.xlsx das Bases SPWR e gera data/contratos.json.
# Rode com: npm run sync
#
# Nao instala nada e nao escreve no Supabase. O JSON gerado deve ser commitado
# para que o deploy na Vercel enxergue os dados atualizados.

param(
  [string]$Path = "G:\.shortcut-targets-by-id\0B79q2rIj_NxpekNXZHFnSnpRY2c\2. Dir. OP\1 - Atualização Periódica\Bases SPWR\Contratos.xlsx",
  [string]$OutFile
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$raiz = Split-Path -Parent $PSScriptRoot
if (-not $OutFile) { $OutFile = Join-Path $raiz 'data\contratos.json' }

# O Drive costuma manter o arquivo aberto; copiar para temp evita erro de lock.
$temp = Join-Path $env:TEMP "cockpit-contratos-sync.xlsx"
Copy-Item $Path $temp -Force

function Get-ColIndex([string]$ref) {
  $letters = ($ref -replace '\d', '')
  $idx = 0
  foreach ($ch in $letters.ToCharArray()) { $idx = $idx * 26 + ([int][char]$ch - 64) }
  return $idx - 1
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($temp)
try {
  $shared = New-Object System.Collections.ArrayList
  $sharedEntry = $zip.Entries | Where-Object { $_.FullName -eq 'xl/sharedStrings.xml' }
  if ($sharedEntry) {
    $sr = New-Object System.IO.StreamReader($sharedEntry.Open())
    [xml]$ssXml = $sr.ReadToEnd(); $sr.Close()
    $nsS = New-Object System.Xml.XmlNamespaceManager($ssXml.NameTable)
    $nsS.AddNamespace('a', $ssXml.DocumentElement.NamespaceURI)
    foreach ($si in $ssXml.SelectNodes('//a:si', $nsS)) {
      [void]$shared.Add((($si.SelectNodes('.//a:t', $nsS) | ForEach-Object { $_.InnerText }) -join ''))
    }
  }

  $sheetEntry = $zip.Entries | Where-Object { $_.FullName -eq 'xl/worksheets/sheet1.xml' }
  $sr2 = New-Object System.IO.StreamReader($sheetEntry.Open())
  [xml]$sheetXml = $sr2.ReadToEnd(); $sr2.Close()
  $ns = New-Object System.Xml.XmlNamespaceManager($sheetXml.NameTable)
  $ns.AddNamespace('a', $sheetXml.DocumentElement.NamespaceURI)

  $headers = @{}
  $registros = New-Object System.Collections.ArrayList
  $linha = 0

  foreach ($row in $sheetXml.SelectNodes('//a:sheetData/a:row', $ns)) {
    $linha++
    $cells = @{}
    foreach ($c in $row.ChildNodes) {
      $ref = $c.GetAttribute('r')
      if (-not $ref) { continue }
      $tipo = $c.GetAttribute('t')
      if ($tipo -eq 'inlineStr') {
        $isNode = $c.SelectSingleNode('a:is', $ns)
        $val = if ($isNode) { ($isNode.SelectNodes('.//a:t', $ns) | ForEach-Object { $_.InnerText }) -join '' } else { '' }
      }
      else {
        $v = $c.SelectSingleNode('a:v', $ns)
        $val = if ($v) { $v.InnerText } else { '' }
        if ($tipo -eq 's' -and $val -ne '') { $val = $shared[[int]$val] }
      }
      $cells[(Get-ColIndex $ref)] = $val
    }

    if ($linha -eq 1) {
      foreach ($k in $cells.Keys) { $headers[$cells[$k]] = $k }
      continue
    }

    function Campo([string]$nome) {
      if (-not $headers.ContainsKey($nome)) { return '' }
      $i = $headers[$nome]
      if ($cells.ContainsKey($i)) { return "$($cells[$i])".Trim() }
      return ''
    }

    $nome = Campo 'Nome Contrato'
    if ($nome -eq '') { continue }

    [void]$registros.Add([ordered]@{
      nome                = $nome
      cliente             = Campo 'Nome Fantasia'
      status              = Campo 'Status do Projeto'
      interno             = (Campo 'Projeto Interno') -eq 'Sim'
      unidade             = Campo 'Unidade de Negócio'
      gerenteProjeto      = Campo 'Gerente de Projeto'
      gerenteVenda        = Campo 'Gerente de Venda'
      dataEntrada         = Campo 'Data Entrada'
      dataRenovacao       = Campo 'Data de Renovação'
      dataTerminoVendido  = Campo 'Data Término Vendido'
      tipoDuracao         = Campo 'Tipo Duração'
      aceiteCliente       = Campo 'Aceite do Cliente'
      valorTotal          = Campo 'Valor Total'
      receitaRecorrente   = Campo 'Receita Recorrente Anual'
      motivoNaoRenovacao  = Campo 'Motivo Não Renovação'
      servicos            = Campo 'Serviços'
    })
  }

  $saida = [ordered]@{
    gerado    = (Get-Date).ToString('yyyy-MM-ddTHH:mm:ss')
    origem    = Split-Path -Leaf $Path
    total     = $registros.Count
    contratos = $registros
  }

  $dir = Split-Path -Parent $OutFile
  if (-not (Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null }

  $json = $saida | ConvertTo-Json -Depth 5
  [System.IO.File]::WriteAllText($OutFile, $json, (New-Object System.Text.UTF8Encoding($false)))

  Write-Host "OK: $($registros.Count) contratos gravados em $OutFile"
}
finally {
  $zip.Dispose()
  Remove-Item $temp -Force -ErrorAction SilentlyContinue
}
