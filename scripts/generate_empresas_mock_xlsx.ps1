$ErrorActionPreference = 'Stop'

function New-ValidCNPJ([string]$base12) {
  $digits = $base12.ToCharArray() | ForEach-Object { [int][string]$_ }
  $weights1 = 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2
  $sum1 = 0

  for ($i = 0; $i -lt 12; $i++) {
    $sum1 += $digits[$i] * $weights1[$i]
  }

  $rest1 = $sum1 % 11
  $d1 = if ($rest1 -lt 2) { 0 } else { 11 - $rest1 }

  $digits2 = $digits + $d1
  $weights2 = 6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2
  $sum2 = 0

  for ($i = 0; $i -lt 13; $i++) {
    $sum2 += $digits2[$i] * $weights2[$i]
  }

  $rest2 = $sum2 % 11
  $d2 = if ($rest2 -lt 2) { 0 } else { 11 - $rest2 }

  return (($digits + $d1 + $d2) -join '')
}

function Escape-Xml([string]$value) {
  return [System.Security.SecurityElement]::Escape($value)
}

function Write-ZipEntry(
  [System.IO.Compression.ZipArchive]$zip,
  [string]$entryName,
  [string]$content
) {
  $entry = $zip.CreateEntry($entryName)
  $utf8NoBom = New-Object System.Text.UTF8Encoding($false)
  $stream = $entry.Open()
  $writer = New-Object System.IO.StreamWriter($stream, $utf8NoBom)
  $writer.Write($content)
  $writer.Dispose()
  $stream.Dispose()
}

$records = @(
  @{ nome_empresa = 'Supermercado Bahia Norte LTDA'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 28; prejuizo = '185000,00' },
  @{ nome_empresa = 'Padaria Sao Mateus Fornos LTDA'; setor = 'comercio'; impacto = 'operacao_interrompida'; funcionarios = 14; prejuizo = '68000,00' },
  @{ nome_empresa = 'Malharia Benfica Textil EIRELI'; setor = 'industria'; impacto = 'estrutura_danificada'; funcionarios = 41; prejuizo = '320000,00' },
  @{ nome_empresa = 'Transportadora Linha Viva JF LTDA'; setor = 'transporte'; impacto = 'acesso_comprometido'; funcionarios = 22; prejuizo = '97000,00' },
  @{ nome_empresa = 'Hotel Serra Imperial JF LTDA'; setor = 'turismo'; impacto = 'queda_receita'; funcionarios = 33; prejuizo = '210000,00' },
  @{ nome_empresa = 'Construtora Morro do Cristo SPE'; setor = 'construcao'; impacto = 'operacao_interrompida'; funcionarios = 57; prejuizo = '455000,00' },
  @{ nome_empresa = 'Laticinios Mantiqueira Centro Ltda'; setor = 'industria'; impacto = 'perda_equipamentos'; funcionarios = 19; prejuizo = '149000,00' },
  @{ nome_empresa = 'Autopecas Rio Branco Comercio Ltda'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 11; prejuizo = '74000,00' },
  @{ nome_empresa = 'Clinica Popular Santa Terezinha Ltda'; setor = 'servicos'; impacto = 'estrutura_danificada'; funcionarios = 26; prejuizo = '133000,00' },
  @{ nome_empresa = 'Cafe Colonial Mariano Procopio Ltda'; setor = 'servicos'; impacto = 'queda_receita'; funcionarios = 16; prejuizo = '58000,00' },
  @{ nome_empresa = 'Mercadinho Grama Central Ltda'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 9; prejuizo = '47000,00' },
  @{ nome_empresa = 'JF Log Hub Distribuicao Ltda'; setor = 'transporte'; impacto = 'acesso_comprometido'; funcionarios = 37; prejuizo = '198000,00' },
  @{ nome_empresa = 'Oficina Diesel Salvaterra Ltda'; setor = 'servicos'; impacto = 'perda_equipamentos'; funcionarios = 13; prejuizo = '91000,00' },
  @{ nome_empresa = 'Moveis Benfica Planejados Ltda'; setor = 'industria'; impacto = 'estrutura_danificada'; funcionarios = 24; prejuizo = '162000,00' },
  @{ nome_empresa = 'Academia Cascatinha Performance Ltda'; setor = 'servicos'; impacto = 'operacao_interrompida'; funcionarios = 12; prejuizo = '52000,00' },
  @{ nome_empresa = 'Armazem Sao Pedro Conveniencia Ltda'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 7; prejuizo = '39000,00' },
  @{ nome_empresa = 'Pousada Mirante da Mata Ltda'; setor = 'turismo'; impacto = 'queda_receita'; funcionarios = 18; prejuizo = '116000,00' },
  @{ nome_empresa = 'Metalurgica Distrito Norte Ltda'; setor = 'industria'; impacto = 'perda_equipamentos'; funcionarios = 46; prejuizo = '388000,00' },
  @{ nome_empresa = 'Agropecuaria Caete Rural Ltda'; setor = 'agropecuaria'; impacto = 'acesso_comprometido'; funcionarios = 21; prejuizo = '129000,00' },
  @{ nome_empresa = 'Restaurante Halfeld Executivo Ltda'; setor = 'servicos'; impacto = 'operacao_interrompida'; funcionarios = 17; prejuizo = '84000,00' },
  @{ nome_empresa = 'Farmacia Bom Pastor Popular Ltda'; setor = 'comercio'; impacto = 'estrutura_danificada'; funcionarios = 10; prejuizo = '61000,00' },
  @{ nome_empresa = 'Confeccoes Nova Era JF Ltda'; setor = 'industria'; impacto = 'queda_receita'; funcionarios = 29; prejuizo = '173000,00' },
  @{ nome_empresa = 'Deposito de Bebidas Santa Luzia Ltda'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 8; prejuizo = '56000,00' },
  @{ nome_empresa = 'Centro Automotivo Ipiranga JF Ltda'; setor = 'servicos'; impacto = 'perda_equipamentos'; funcionarios = 15; prejuizo = '102000,00' },
  @{ nome_empresa = 'Edifica Zona Norte Obras Ltda'; setor = 'construcao'; impacto = 'acesso_comprometido'; funcionarios = 34; prejuizo = '247000,00' },
  @{ nome_empresa = 'Distribuidora Retiro Seco Ltda'; setor = 'transporte'; impacto = 'operacao_interrompida'; funcionarios = 27; prejuizo = '141000,00' },
  @{ nome_empresa = 'Doces Coloniais Sao Dimas Ltda'; setor = 'industria'; impacto = 'perda_estoque'; funcionarios = 20; prejuizo = '89000,00' },
  @{ nome_empresa = 'Loja de Colchoes Alto dos Passos Ltda'; setor = 'comercio'; impacto = 'estrutura_danificada'; funcionarios = 6; prejuizo = '43000,00' },
  @{ nome_empresa = 'Laboratorio Clinico Vila Ideal Ltda'; setor = 'servicos'; impacto = 'operacao_interrompida'; funcionarios = 31; prejuizo = '176000,00' },
  @{ nome_empresa = 'Borracharia Avenida Brasil Ltda'; setor = 'servicos'; impacto = 'acesso_comprometido'; funcionarios = 5; prejuizo = '28000,00' },
  @{ nome_empresa = 'Mercantil Linhares Atacado Ltda'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 39; prejuizo = '264000,00' },
  @{ nome_empresa = 'JF Turismo Receptivo Ltda'; setor = 'turismo'; impacto = 'queda_receita'; funcionarios = 14; prejuizo = '72000,00' },
  @{ nome_empresa = 'Serralheria Dom Bosco Ltda'; setor = 'industria'; impacto = 'perda_equipamentos'; funcionarios = 12; prejuizo = '68000,00' },
  @{ nome_empresa = 'Atelie Textil Manoel Honorio Ltda'; setor = 'industria'; impacto = 'estrutura_danificada'; funcionarios = 9; prejuizo = '54000,00' },
  @{ nome_empresa = 'Mercado Nossa Senhora Aparecida Ltda'; setor = 'comercio'; impacto = 'operacao_interrompida'; funcionarios = 18; prejuizo = '97000,00' },
  @{ nome_empresa = 'Logistica Trevo BR040 Ltda'; setor = 'transporte'; impacto = 'acesso_comprometido'; funcionarios = 44; prejuizo = '305000,00' },
  @{ nome_empresa = 'Hotel Fazenda Salvaterra Eventos Ltda'; setor = 'turismo'; impacto = 'queda_receita'; funcionarios = 25; prejuizo = '189000,00' },
  @{ nome_empresa = 'JF Vidros e Esquadrias Ltda'; setor = 'industria'; impacto = 'perda_equipamentos'; funcionarios = 23; prejuizo = '158000,00' },
  @{ nome_empresa = 'Casa de Carnes Teixeiras Ltda'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 11; prejuizo = '63000,00' },
  @{ nome_empresa = 'Clinica Veterinaria Granjas Bethania Ltda'; setor = 'servicos'; impacto = 'estrutura_danificada'; funcionarios = 13; prejuizo = '81000,00' },
  @{ nome_empresa = 'Agroforte Insumos JF Ltda'; setor = 'agropecuaria'; impacto = 'acesso_comprometido'; funcionarios = 17; prejuizo = '111000,00' },
  @{ nome_empresa = 'Engeminas Obras Urbanas Ltda'; setor = 'construcao'; impacto = 'operacao_interrompida'; funcionarios = 52; prejuizo = '402000,00' },
  @{ nome_empresa = 'Atacado de Limpeza Mariano Procopio Ltda'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 16; prejuizo = '93000,00' },
  @{ nome_empresa = 'Papelaria Independencia Escolar Ltda'; setor = 'comercio'; impacto = 'estrutura_danificada'; funcionarios = 7; prejuizo = '35000,00' },
  @{ nome_empresa = 'Lavanderia Hospitalar JF Ltda'; setor = 'servicos'; impacto = 'perda_equipamentos'; funcionarios = 28; prejuizo = '167000,00' },
  @{ nome_empresa = 'Fabrica de Sorvetes Benfica Ltda'; setor = 'industria'; impacto = 'operacao_interrompida'; funcionarios = 18; prejuizo = '121000,00' },
  @{ nome_empresa = 'Centro de Convencoes Imperador Ltda'; setor = 'turismo'; impacto = 'queda_receita'; funcionarios = 30; prejuizo = '214000,00' },
  @{ nome_empresa = 'Distribuidora Santa Cruz Embalagens Ltda'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 22; prejuizo = '136000,00' },
  @{ nome_empresa = 'Oficina Pesada Zona Leste Ltda'; setor = 'servicos'; impacto = 'acesso_comprometido'; funcionarios = 19; prejuizo = '99000,00' },
  @{ nome_empresa = 'Construtora Vale do Paraibuna Ltda'; setor = 'construcao'; impacto = 'estrutura_danificada'; funcionarios = 48; prejuizo = '376000,00' },
  @{ nome_empresa = 'Mercado Alto Bairu Popular Ltda'; setor = 'comercio'; impacto = 'perda_estoque'; funcionarios = 12; prejuizo = '67000,00' }
)

$headers = @(
  'nome_empresa',
  'cnpj',
  'estado',
  'municipio',
  'setor_economico',
  'numero_funcionarios',
  'tipo_impacto',
  'prejuizo_estimado'
)

$rows = New-Object System.Collections.Generic.List[string]
$headerCells = @()

for ($c = 0; $c -lt $headers.Count; $c++) {
  $col = [char](65 + $c)
  $headerCells += "<c r='$col`1' t='inlineStr'><is><t>$(Escape-Xml $headers[$c])</t></is></c>"
}

$rows.Add("<row r='1'>$($headerCells -join '')</row>")

for ($i = 0; $i -lt $records.Count; $i++) {
  $record = $records[$i]
  $rowNumber = $i + 2
  $base12 = '{0:D12}' -f ([long](10000000 + $i + 1) * 10000 + 1)
  $cnpj = New-ValidCNPJ $base12

  $values = @(
    @{ value = $record.nome_empresa; type = 'inline' },
    @{ value = $cnpj; type = 'inline' },
    @{ value = 'MG'; type = 'inline' },
    @{ value = 'Juiz de Fora'; type = 'inline' },
    @{ value = $record.setor; type = 'inline' },
    @{ value = [string]$record.funcionarios; type = 'number' },
    @{ value = $record.impacto; type = 'inline' },
    @{ value = $record.prejuizo; type = 'inline' }
  )

  $cells = @()

  for ($c = 0; $c -lt $values.Count; $c++) {
    $col = [char](65 + $c)

    if ($values[$c].type -eq 'number') {
      $cells += "<c r='$col$rowNumber'><v>$($values[$c].value)</v></c>"
    } else {
      $cells += "<c r='$col$rowNumber' t='inlineStr'><is><t>$(Escape-Xml ([string]$values[$c].value))</t></is></c>"
    }
  }

  $rows.Add("<row r='$rowNumber'>$($cells -join '')</row>")
}

$sheetXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    $($rows -join "`n    ")
  </sheetData>
</worksheet>
"@

$contentTypes = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
  <Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
  <Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>
</Types>
"@

$relsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/>
  <Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/>
</Relationships>
"@

$workbookXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="empresas_afetadas" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
"@

$workbookRelsXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
</Relationships>
"@

$stylesXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
  <borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>
  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
  <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
  <cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>
</styleSheet>
"@

$coreXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:dcmitype="http://purl.org/dc/dcmitype/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance">
  <dc:title>Importacao Empresas JF Mock</dc:title>
  <dc:creator>Codex</dc:creator>
  <cp:lastModifiedBy>Codex</cp:lastModifiedBy>
  <dcterms:created xsi:type="dcterms:W3CDTF">2026-03-17T00:00:00Z</dcterms:created>
  <dcterms:modified xsi:type="dcterms:W3CDTF">2026-03-17T00:00:00Z</dcterms:modified>
</cp:coreProperties>
"@

$appXml = @"
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes">
  <Application>Codex</Application>
</Properties>
"@

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$outputPath = Join-Path $PSScriptRoot '..\\public\\templates\\importacao_empresas_jf_mock_50_registros.xlsx'
$outputPath = [System.IO.Path]::GetFullPath($outputPath)

if (Test-Path $outputPath) {
  Remove-Item $outputPath -Force
}

$zip = [System.IO.Compression.ZipFile]::Open($outputPath, [System.IO.Compression.ZipArchiveMode]::Create)

try {
  Write-ZipEntry $zip '[Content_Types].xml' $contentTypes
  Write-ZipEntry $zip '_rels/.rels' $relsXml
  Write-ZipEntry $zip 'docProps/core.xml' $coreXml
  Write-ZipEntry $zip 'docProps/app.xml' $appXml
  Write-ZipEntry $zip 'xl/workbook.xml' $workbookXml
  Write-ZipEntry $zip 'xl/_rels/workbook.xml.rels' $workbookRelsXml
  Write-ZipEntry $zip 'xl/styles.xml' $stylesXml
  Write-ZipEntry $zip 'xl/worksheets/sheet1.xml' $sheetXml
} finally {
  $zip.Dispose()
}

Get-Item $outputPath | Select-Object FullName, Length, LastWriteTime
