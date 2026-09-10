Add-Type -AssemblyName System.Drawing
$galleryPath=Join-Path $PSScriptRoot '../test-results/route-gallery.html'
$content=Get-Content -Raw -LiteralPath $galleryPath
$cards=[regex]::Matches($content,'<figure><svg viewBox="0 0 ([\d.]+) ([\d.]+)">.*?<polyline points="([^"]+)".*?<figcaption>([^<]+)</figcaption></figure>')
for($orgIndex=0;$orgIndex -lt 3;$orgIndex++) {
 $bitmap=[System.Drawing.Bitmap]::new(1250,1900)
 $graphics=[System.Drawing.Graphics]::FromImage($bitmap)
 $graphics.Clear([System.Drawing.Color]::White)
 $graphics.SmoothingMode=[System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
 $font=[System.Drawing.Font]::new('Arial',10)
 $pen=[System.Drawing.Pen]::new([System.Drawing.Color]::Teal,2)
 for($cardIndex=0;$cardIndex -lt 50;$cardIndex++) {
  $card=$cards[$orgIndex*50+$cardIndex]
  if($null -eq $card){continue}
  $left=($cardIndex%5)*250+12;$top=[Math]::Floor($cardIndex/5)*190+12
  $scale=[Math]::Min(220/[double]$card.Groups[1].Value,150/[double]$card.Groups[2].Value)
  $points=@($card.Groups[3].Value.Split(' ') | ForEach-Object { $xy=$_.Split(','); [System.Drawing.PointF]::new($left+[double]$xy[0]*$scale,$top+[double]$xy[1]*$scale) })
  $graphics.DrawLines($pen,[System.Drawing.PointF[]]$points)
  $graphics.FillEllipse([System.Drawing.Brushes]::Green,$points[0].X-4,$points[0].Y-4,8,8)
  $graphics.FillEllipse([System.Drawing.Brushes]::Red,$points[-1].X-4,$points[-1].Y-4,8,8)
  $graphics.DrawString($card.Groups[4].Value,$font,[System.Drawing.Brushes]::Black,$left,$top+157)
 }
 $output=Join-Path $PSScriptRoot "../test-results/routes-$orgIndex.png"
 $bitmap.Save($output,[System.Drawing.Imaging.ImageFormat]::Png)
 $pen.Dispose();$font.Dispose();$graphics.Dispose();$bitmap.Dispose()
}
