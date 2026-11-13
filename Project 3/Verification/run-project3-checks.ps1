$ErrorActionPreference='Stop'
$qaRoot='C:\Users\user\Documents\Y3S1\My Portfolio - Final\Project 3\Verification'
$browser=Start-Process -FilePath 'C:\Program Files\Google\Chrome\Application\chrome.exe' -ArgumentList @('--headless','--no-first-run','--autoplay-policy=no-user-gesture-required','--remote-debugging-port=9257',('--user-data-dir='+$env:TEMP+'\project3-journal-browser-profile'),'about:blank') -WindowStyle Hidden -PassThru
$ws=$null
try {
 $target=$null
 for($i=0;$i -lt 40;$i++){try{$targets=Invoke-RestMethod -Uri 'http://127.0.0.1:9257/json/list'; $target=$targets | Where-Object type -eq 'page' | Select-Object -First 1;if($target){break}}catch{};Start-Sleep -Milliseconds 200}
 if(-not $target){throw 'Browser debugging endpoint unavailable'}
 $ws=[Net.WebSockets.ClientWebSocket]::new();$ws.ConnectAsync([Uri]$target.webSocketDebuggerUrl,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
 $script:commandId=0;$script:events=[Collections.Generic.List[object]]::new()
 function Send-CDP($method,$parameters){
  $script:commandId++;$id=$script:commandId
  $data=[Text.Encoding]::UTF8.GetBytes((@{id=$id;method=$method;params=$parameters}|ConvertTo-Json -Compress -Depth 25))
  $ws.SendAsync([ArraySegment[byte]]::new($data),[Net.WebSockets.WebSocketMessageType]::Text,$true,[Threading.CancellationToken]::None).GetAwaiter().GetResult()
  $token=[Threading.CancellationTokenSource]::new(60000)
  try{while($true){$mem=[IO.MemoryStream]::new();try{do{$buf=New-Object byte[] 65536;$received=$ws.ReceiveAsync([ArraySegment[byte]]::new($buf),$token.Token).GetAwaiter().GetResult();$mem.Write($buf,0,$received.Count)}while(-not $received.EndOfMessage);$reply=[Text.Encoding]::UTF8.GetString($mem.ToArray())|ConvertFrom-Json}finally{$mem.Dispose()};if($reply.id -eq $id){return $reply};$script:events.Add($reply)}}finally{$token.Dispose()}
 }
 $null=Send-CDP 'Page.enable' @{};$null=Send-CDP 'Runtime.enable' @{};$null=Send-CDP 'Network.enable' @{}
 $null=Send-CDP 'Emulation.setEmulatedMedia' @{features=@(@{name='prefers-reduced-motion';value='reduce'})}
 $summaries=@();$shots=[Collections.Generic.List[object]]::new();$rawResults=[Collections.Generic.List[object]]::new()
 foreach($view in @(@{name='desktop';width=1440;height=1000;mobile=$false},@{name='tablet';width=768;height=1024;mobile=$false},@{name='mobile';width=390;height=844;mobile=$true})){
  $script:events.Clear();$null=Send-CDP 'Emulation.setDeviceMetricsOverride' @{width=$view.width;height=$view.height;deviceScaleFactor=1;mobile=$view.mobile};$null=Send-CDP 'Page.navigate' @{url='http://127.0.0.1:5503/'};Start-Sleep -Milliseconds 600
  $result=Send-CDP 'Runtime.evaluate' @{expression=[IO.File]::ReadAllText((Join-Path $qaRoot 'project3-tests.js'));awaitPromise=$true;returnByValue=$true};$rawResults.Add(@{Name=$view.name;Result=$result.result})
  if($result.result.exceptionDetails){$result.result.exceptionDetails|ConvertTo-Json -Depth 12;throw 'Project 3 browser exception'}
  $v=$result.result.result.value;$errors=@($script:events|Where-Object method -eq 'Runtime.exceptionThrown'|ForEach-Object {$_.params.exceptionDetails});$summary=[PSCustomObject]@{Viewport=$view.name;Passed=$v.passed;Total=$v.total;Failures=@($v.results|Where-Object {-not $_.ok});ScriptErrors=$errors};$summary|ConvertTo-Json -Depth 12;$summaries+=$summary
  $null=Send-CDP 'Runtime.evaluate' @{expression='document.querySelectorAll("#projects [data-project]")[2].click();document.querySelector("#project-dialog").scrollTop=0;'}
  $shot=Send-CDP 'Page.captureScreenshot' @{format='png'};$shots.Add(@{Name=$view.name+'-journal.png';Data=$shot.result.data})
  $null=Send-CDP 'Runtime.evaluate' @{expression='document.querySelector("#mapping-process").scrollIntoView({block:"start",behavior:"instant"})'}
  $shot=Send-CDP 'Page.captureScreenshot' @{format='png'};$shots.Add(@{Name=$view.name+'-process.png';Data=$shot.result.data})
  $null=Send-CDP 'Runtime.evaluate' @{expression='(async()=>{const v=document.querySelector(".mapping-video");v.scrollIntoView({block:"center",behavior:"instant"});await v.play();await new Promise(r=>setTimeout(r,300))})()';awaitPromise=$true}
  $shot=Send-CDP 'Page.captureScreenshot' @{format='png'};$shots.Add(@{Name=$view.name+'-showcase.png';Data=$shot.result.data})
  $null=Send-CDP 'Input.dispatchKeyEvent' @{type='keyDown';key='Escape';code='Escape';windowsVirtualKeyCode=27};$null=Send-CDP 'Input.dispatchKeyEvent' @{type='keyUp';key='Escape';code='Escape';windowsVirtualKeyCode=27}
  $check=Send-CDP 'Runtime.evaluate' @{expression='(async()=>{await new Promise(r=>setTimeout(r,60));return !document.querySelector("#project-dialog").open&&document.querySelector(".mapping-video").paused})()';awaitPromise=$true;returnByValue=$true};'Native Escape closes and pauses '+$view.name+': '+$check.result.result.value
  $null=Send-CDP 'Runtime.evaluate' @{expression='document.querySelectorAll("#projects [data-project]")[2].click()'}
  $null=Send-CDP 'Input.dispatchMouseEvent' @{type='mousePressed';x=1;y=1;button='left';clickCount=1};$null=Send-CDP 'Input.dispatchMouseEvent' @{type='mouseReleased';x=1;y=1;button='left';clickCount=1}
  $check=Send-CDP 'Runtime.evaluate' @{expression='(async()=>{await new Promise(r=>setTimeout(r,60));return !document.querySelector("#project-dialog").open})()';awaitPromise=$true;returnByValue=$true};'Backdrop closes '+$view.name+': '+$check.result.result.value
 }
 $null=Send-CDP 'Browser.close' @{}
 foreach($raw in $rawResults){$raw.Result|ConvertTo-Json -Depth 30|Set-Content -LiteralPath (Join-Path $qaRoot ($raw.Name+'-results.json')) -Encoding UTF8}
 foreach($shot in $shots){[IO.File]::WriteAllBytes((Join-Path $qaRoot $shot.Name),[Convert]::FromBase64String($shot.Data))}
 $summaries|ConvertTo-Json -Depth 20|Set-Content -LiteralPath (Join-Path $qaRoot 'summary.json') -Encoding UTF8
}finally{if($ws){$ws.Dispose()};if(-not $browser.HasExited){Stop-Process -Id $browser.Id -ErrorAction SilentlyContinue}}