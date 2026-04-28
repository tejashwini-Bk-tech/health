$files = @(
  "app/login/page.tsx",
  "app/dashboard/page.tsx",
  "app/alerts/page.tsx",
  "app/report/page.tsx",
  "app/map/page.tsx",
  "app/learn/page.tsx"
)

$replacements = @{
  'text-\[hsl\(0,0%,95%\)\]' = 'text-gray-900'
  'text-\[hsl\(0,0%,92%\)\]' = 'text-gray-800'
  'text-\[hsl\(0,0%,90%\)\]' = 'text-gray-800'
  'text-\[hsl\(222,15%,50%\)\]' = 'text-gray-500'
  'text-\[hsl\(222,15%,55%\)\]' = 'text-gray-500'
  'text-\[hsl\(222,15%,45%\)\]' = 'text-gray-400'
  'text-\[hsl\(222,15%,40%\)\]' = 'text-gray-400'
  'text-\[hsl\(222,15%,35%\)\]' = 'text-gray-300'
  'text-\[hsl\(222,15%,60%\)\]' = 'text-gray-600'
  'text-\[hsl\(222,15%,65%\)\]' = 'text-gray-600'
  'hover:text-\[hsl\(0,0%,90%\)\]' = 'hover:text-gray-800'
  'hover:text-\[hsl\(0,0%,95%\)\]' = 'hover:text-gray-900'
  'hover:bg-\[hsl\(222,25%,14%\)\]' = 'hover:bg-gray-100'
  'hover:bg-\[hsl\(222,25%,14%,0\.5\)\]' = 'hover:bg-gray-100/60'
  'bg-\[hsl\(222,25%,14%\)\]' = 'bg-gray-100'
  'bg-\[hsl\(222,25%,12%\)\]' = 'bg-gray-50'
  'bg-\[hsl\(222,25%,8%\)\]' = 'bg-gray-50'
  'border-\[hsl\(222,20%,18%,0\.5\)\]' = 'border-gray-200'
  'text-\[hsl\(160,84%,55%\)\]' = 'text-[hsl(160,84%,32%)]'
  'text-\[hsl\(160,84%,65%\)\]' = 'text-[hsl(160,84%,28%)]'
  'hover:text-\[hsl\(160,84%,55%\)\]' = 'hover:text-[hsl(160,84%,28%)]'
  'hover:text-\[hsl\(160,84%,65%\)\]' = 'hover:text-[hsl(160,84%,25%)]'
  'text-\[hsl\(210,90%,65%\)\]' = 'text-[hsl(210,80%,42%)]'
  'text-\[hsl\(0,85%,65%\)\]' = 'text-[hsl(0,75%,45%)]'
  'text-\[hsl\(0,85%,68%\)\]' = 'text-[hsl(0,75%,42%)]'
  'text-\[hsl\(0,85%,75%,0\.7\)\]' = 'text-[hsl(0,60%,55%)]'
  'text-\[hsl\(25,95%,65%\)\]' = 'text-[hsl(25,80%,40%)]'
  'text-\[hsl\(38,92%,65%\)\]' = 'text-[hsl(38,80%,38%)]'
  'text-\[hsl\(270,70%,70%\)\]' = 'text-[hsl(270,60%,45%)]'
  'bg-black/60' = 'bg-black/30'
  'style=\{?\{background:"hsl\(222,30%,10%,0\.95\)"\}' = 'style={{background:"hsl(0,0%,100%,0.97)"}'
  'color:\`hsl\(\$\{opt\.color\}\)\`' = 'color:`hsl(${opt.color})`'
}

foreach ($file in $files) {
  $content = Get-Content $file -Raw
  foreach ($pattern in $replacements.Keys) {
    $content = $content -replace $pattern, $replacements[$pattern]
  }
  Set-Content $file $content -NoNewline
  Write-Host "Updated $file"
}
