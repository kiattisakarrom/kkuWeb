param([Parameter(Mandatory=$true)][string]$NativeRoot)
$ErrorActionPreference='Stop'
$workspaceRoot=Split-Path -Parent $PSScriptRoot
$assetRoot=Join-Path $workspaceRoot 'back\assets\reports\iv'
[void][IO.Directory]::CreateDirectory($assetRoot)
[void][Reflection.Assembly]::LoadFrom((Join-Path $NativeRoot 'bin\Debug\CrystalDecisions.CrystalReports.Engine.dll'))
[void][Reflection.Assembly]::LoadFrom((Join-Path $NativeRoot 'bin\Debug\CrystalDecisions.Shared.dll'))
foreach($variant in @('ward','total')) {
  $report=New-Object CrystalDecisions.CrystalReports.Engine.ReportDocument
  try {
    $file=if($variant -eq 'ward'){'crpSendmix.rpt'}else{'crpSendmixTotalward.rpt'}
    $report.Load((Join-Path $NativeRoot "Report\Sendmix\$file"))
    $sections=@()
    foreach($section in $report.ReportDefinition.Sections) {
      $objects=@()
      foreach($obj in $section.ReportObjects) {
        $entry=[ordered]@{name=$obj.Name;kind=$obj.Kind.ToString();left=$obj.Left;top=$obj.Top;width=$obj.Width;height=$obj.Height}
        if($obj.Kind.ToString() -eq 'TextObject'){$entry.text=$obj.Text}
        if($obj.Kind.ToString() -eq 'FieldObject'){$entry.field=$obj.DataSource.Name}
        if($obj.Kind.ToString() -in @('TextObject','FieldObject')){
          $entry.font=$obj.Font.Name;$entry.fontSize=$obj.Font.Size;$entry.bold=$obj.Font.Bold
          $entry.align=$obj.ObjectFormat.HorizontalAlignment.ToString()
          $entry.canGrow=$obj.ObjectFormat.EnableCanGrow
        }
        $objects += [pscustomobject]$entry
        # Keep only the original static artwork; all dynamic values are drawn by the web.
        if($obj.Kind.ToString() -eq 'FieldObject'){$obj.ObjectFormat.EnableSuppress=$true}
      }
      $sections += [pscustomobject]@{name=$section.Name;kind=$section.Kind.ToString();height=$section.Height;objects=$objects}
    }
    $table=New-Object System.Data.DataTable 'sendmix'
    foreach($name in @('prescriptionno','an','patientname','wardname','orderitemname','dosage','username','status','freetext3')){[void]$table.Columns.Add($name,[string])}
    $row=$table.NewRow();foreach($column in $table.Columns){$row[$column.ColumnName]=''};$table.Rows.Add($row)
    $report.SetDataSource($table)
    $report.PrintOptions.NoPrinter=$true
    $report.ExportToDisk([CrystalDecisions.Shared.ExportFormatType]::PortableDocFormat,(Join-Path $assetRoot "$variant-template.pdf"))
    $margins=$report.PrintOptions.PageMargins
    $meta=[ordered]@{source=$file;pageWidth=$report.PrintOptions.PageContentWidth;pageHeight=$report.PrintOptions.PageContentHeight;margins=@{left=$margins.leftMargin;right=$margins.rightMargin;top=$margins.topMargin;bottom=$margins.bottomMargin};sections=$sections}
    [IO.File]::WriteAllText((Join-Path $assetRoot "$variant-layout.json"),($meta|ConvertTo-Json -Depth 8),[Text.UTF8Encoding]::new($false))
    Write-Output "Exported $variant static report artwork and coordinates, without database/printer access."
  } finally {$report.Close();$report.Dispose()}
}
