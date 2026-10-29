param([Parameter(Mandatory=$true)][string]$NativeRoot)
$ErrorActionPreference='Stop'
$workspaceRoot=Split-Path -Parent $PSScriptRoot
$assetRoot=Join-Path $workspaceRoot 'back\assets\reports'
[void][IO.Directory]::CreateDirectory($assetRoot)
[void][Reflection.Assembly]::LoadFrom((Join-Path $NativeRoot 'bin\Debug\CrystalDecisions.CrystalReports.Engine.dll'))
[void][Reflection.Assembly]::LoadFrom((Join-Path $NativeRoot 'bin\Debug\CrystalDecisions.Shared.dll'))
$report=New-Object CrystalDecisions.CrystalReports.Engine.ReportDocument
try {
  $report.Load((Join-Path $NativeRoot 'Report\Sendmix\crpADR.rpt'))
  $fields=@()
  foreach ($section in $report.ReportDefinition.Sections) {
    foreach ($obj in $section.ReportObjects) {
      if ($obj.Kind.ToString() -eq 'TextObject' -and $obj.Text -match '\{ADR\.') {
        $fields += [pscustomobject]@{Name=$obj.Name;Left=$obj.Left;Top=$obj.Top;Width=$obj.Width;Height=$obj.Height;Text=$obj.Text}
        $obj.ObjectFormat.EnableSuppress=$true
      }
      if ($obj.Kind.ToString() -in @('TextObject','FieldObject')) {
        $obj.ApplyFont((New-Object System.Drawing.Font('Tahoma',($obj.Font.Size*0.70),$obj.Font.Style)))
      }
    }
  }
  $table=New-Object System.Data.DataTable 'ADR'
  foreach ($name in @('hn','an','patientname','patientdob','age','orderitemname','dosage','sexM','sexF','StartDate','EndDate','adrDe','adrH','adrNH','SOI','address','idcard')) { [void]$table.Columns.Add($name,[string]) }
  $row=$table.NewRow()
  foreach ($column in $table.Columns) { $row[$column.ColumnName]='' }
  $table.Rows.Add($row)
  $report.SetDataSource($table)
  $report.PrintOptions.NoPrinter=$true
  $report.ExportToDisk([CrystalDecisions.Shared.ExportFormatType]::PortableDocFormat,(Join-Path $assetRoot 'adr-template.pdf'))
  [IO.File]::WriteAllText((Join-Path $assetRoot 'adr-fields.json'),($fields|ConvertTo-Json -Depth 4),[Text.UTF8Encoding]::new($false))
  'Exported blank ADR form and field coordinates; no database or printer used.'
} finally { $report.Close();$report.Dispose() }
