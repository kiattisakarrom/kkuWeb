param([Parameter(Mandatory=$true)][string]$NativeRoot,[string]$WorkspaceRoot=(Get-Location).Path)
$ErrorActionPreference='Stop'
$assetRoot=Join-Path $workspaceRoot 'back\assets\reports\workload'
$qaRoot=Join-Path $workspaceRoot 'tmp\pdfs'
[void][IO.Directory]::CreateDirectory($assetRoot)
[void][IO.Directory]::CreateDirectory($qaRoot)
[void][Reflection.Assembly]::LoadFrom((Join-Path $NativeRoot 'bin\Debug\CrystalDecisions.CrystalReports.Engine.dll'))
[void][Reflection.Assembly]::LoadFrom((Join-Path $NativeRoot 'bin\Debug\CrystalDecisions.Shared.dll'))
$report=New-Object CrystalDecisions.CrystalReports.Engine.ReportDocument
try {
  $report.Load((Join-Path $NativeRoot 'Report\Workload\clsWorkloadNew.rpt'))
  $sections=@()
  foreach($section in $report.ReportDefinition.Sections){
    $objects=@()
    foreach($obj in $section.ReportObjects){
      $entry=[ordered]@{name=$obj.Name;kind=$obj.Kind.ToString();left=$obj.Left;top=$obj.Top;width=$obj.Width;height=$obj.Height}
      if($obj.Kind.ToString() -eq 'TextObject'){$entry.text=$obj.Text}
      if($obj.Kind.ToString() -eq 'FieldObject'){$entry.field=$obj.DataSource.Name}
      $objects+=[pscustomobject]$entry
    }
    $sections+=[pscustomobject]@{name=$section.Name;kind=$section.Kind.ToString();height=$section.Height;suppressed=$section.SectionFormat.EnableSuppress;objects=$objects}
  }
  $table=New-Object System.Data.DataTable 'Pharmcare'
  foreach($name in @('Usercreatecode','Fname','GroupOfCareCd','GroupOfCare')){[void]$table.Columns.Add($name,[string])}
  foreach($name in @('CAn','SAn')){[void]$table.Columns.Add($name,[decimal])}
  [void]$table.Columns.Add('Monthname',[datetime])
  $count=0
  foreach($user in @('01','02','03')){
    foreach($care in @('Screening_WL','Checkout','LED','HAD','Medication Reconcile','กลุ่มการดูแลทดสอบ','ADR monitoring','Cancer Care','D/C counselling','Drug Reconciliation')){
      $count++
      $row=$table.NewRow();$row.Usercreatecode=$user;$row.Fname='ผู้ทดสอบ '+$user;$row.GroupOfCareCd='';$row.GroupOfCare=$care;$row.CAn=$count;$row.SAn=0
      $table.Rows.Add($row)
    }
  }
  foreach($spec in @(@('04','ผู้ทดสอบ 04'),@('05','ผู้ทดสอบ 01'))){
    $row=$table.NewRow();$row.Usercreatecode=$spec[0];$row.Fname=$spec[1];$row.GroupOfCareCd='';$row.GroupOfCare='Checkout';$row.CAn=100;$row.SAn=0;$table.Rows.Add($row)
  }
  $report.SetDataSource($table)
  $report.SetParameterValue('StartDate',[datetime]'2026-10-01')
  $report.SetParameterValue('EndDate',[datetime]'2026-10-21')
  $report.PrintOptions.NoPrinter=$true
  $report.ExportToDisk([CrystalDecisions.Shared.ExportFormatType]::PortableDocFormat,(Join-Path $qaRoot 'workload-native-sample.pdf'))
  # A formatted QA export lets us inspect native CrossTab labels independently
  # of legacy PDF font encodings. It contains only the synthetic rows above.
  $report.ExportToDisk([CrystalDecisions.Shared.ExportFormatType]::Excel,(Join-Path $qaRoot 'workload-native-sample.xls'))
  foreach($section in $report.ReportDefinition.Sections){foreach($obj in $section.ReportObjects){
    if($obj.Kind.ToString() -eq 'CrossTabObject' -or $obj.Name -in @('Text10','Text1','Text2')){$obj.ObjectFormat.EnableSuppress=$true}
  }}
  $report.ExportToDisk([CrystalDecisions.Shared.ExportFormatType]::PortableDocFormat,(Join-Path $assetRoot 'template.pdf'))
  $margins=$report.PrintOptions.PageMargins
  $meta=[ordered]@{source='Report/Workload/clsWorkloadNew.rpt';pageWidth=$report.PrintOptions.PageContentWidth;pageHeight=$report.PrintOptions.PageContentHeight;margins=@{left=$margins.leftMargin;right=$margins.rightMargin;top=$margins.topMargin;bottom=$margins.bottomMargin};sections=$sections}
  [IO.File]::WriteAllText((Join-Path $assetRoot 'layout.json'),($meta|ConvertTo-Json -Depth 8),[Text.UTF8Encoding]::new($false))
  'Exported Workload synthetic reference, blank native form and layout; no database or printer accessed.'
}finally{$report.Close();$report.Dispose()}
