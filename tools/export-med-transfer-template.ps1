param([Parameter(Mandatory=$true)][string]$NativeRoot)
$ErrorActionPreference='Stop'
$workspaceRoot=Split-Path -Parent $PSScriptRoot
$assetRoot=Join-Path $workspaceRoot 'back\assets\reports\med-transfer'
[void][IO.Directory]::CreateDirectory($assetRoot)
[void][Reflection.Assembly]::LoadFrom((Join-Path $NativeRoot 'bin\Debug\CrystalDecisions.CrystalReports.Engine.dll'))
[void][Reflection.Assembly]::LoadFrom((Join-Path $NativeRoot 'bin\Debug\CrystalDecisions.Shared.dll'))
$report=New-Object CrystalDecisions.CrystalReports.Engine.ReportDocument
try {
  $report.Load((Join-Path $NativeRoot 'Report\Medtransfer\PharmacyReport.rpt'))
  $sections=@()
  foreach($section in $report.ReportDefinition.Sections) {
    $objects=@()
    foreach($obj in $section.ReportObjects) {
      $entry=[ordered]@{name=$obj.Name;kind=$obj.Kind.ToString();left=$obj.Left;top=$obj.Top;width=$obj.Width;height=$obj.Height}
      if($obj.Kind.ToString() -eq 'TextObject'){$entry.text=$obj.Text}
      if($obj.Kind.ToString() -eq 'FieldObject'){$entry.field=$obj.DataSource.Name}
      if($obj.Kind.ToString() -in @('TextObject','FieldObject')){
        $entry.font=$obj.Font.Name;$entry.fontSize=$obj.Font.Size;$entry.bold=$obj.Font.Bold
        $entry.align=$obj.ObjectFormat.HorizontalAlignment.ToString();$entry.canGrow=$obj.ObjectFormat.EnableCanGrow
      }
      $objects += [pscustomobject]$entry
      if($obj.Kind.ToString() -eq 'FieldObject'){$obj.ObjectFormat.EnableSuppress=$true}
    }
    $sections += [pscustomobject]@{name=$section.Name;kind=$section.Kind.ToString();height=$section.Height;suppressed=$section.SectionFormat.EnableSuppress;objects=$objects}
  }
  $groups=@();foreach($group in $report.DataDefinition.Groups){$groups += [pscustomobject]@{field=$group.ConditionField.Name;sort=$group.GroupOptions.Condition.ToString()}}
  $table=New-Object System.Data.DataTable 'Medcomplete'
  foreach($name in @('prescriptionno','patientname','hn','an','wardname','cartname','username')){[void]$table.Columns.Add($name,[string])}
  $row=$table.NewRow();foreach($column in $table.Columns){$row[$column.ColumnName]=''};$table.Rows.Add($row)
  $report.SetDataSource($table)
  $report.PrintOptions.NoPrinter=$true
  $report.ExportToDisk([CrystalDecisions.Shared.ExportFormatType]::PortableDocFormat,(Join-Path $assetRoot 'template.pdf'))
  $margins=$report.PrintOptions.PageMargins
  $meta=[ordered]@{source='Report/Medtransfer/PharmacyReport.rpt';pageWidth=$report.PrintOptions.PageContentWidth;pageHeight=$report.PrintOptions.PageContentHeight;margins=@{left=$margins.leftMargin;right=$margins.rightMargin;top=$margins.topMargin;bottom=$margins.bottomMargin};groups=$groups;sections=$sections}
  [IO.File]::WriteAllText((Join-Path $assetRoot 'layout.json'),($meta|ConvertTo-Json -Depth 8),[Text.UTF8Encoding]::new($false))
  'Exported original Med Transfer blank form and metadata; no database or printer accessed.'
} finally {$report.Close();$report.Dispose()}
