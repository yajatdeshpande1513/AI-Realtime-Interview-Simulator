$manifests = @(
    "tiny_face_detector_model-weights_manifest.json",
    "face_expression_model-weights_manifest.json",
    "face_landmark_68_model-weights_manifest.json"
)

$baseUrl = "https://raw.githubusercontent.com/vladmandic/face-api/master/model/"

if (!(Test-Path "public/models")) {
    New-Item -ItemType Directory -Path "public/models"
}

foreach ($manifest in $manifests) {
    $url = $baseUrl + $manifest
    $dest = "public/models/" + $manifest
    Write-Host "Downloading manifest $manifest..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest
        
        # Read the manifest to find paths
        $content = Get-Content $dest | ConvertFrom-Json
        foreach ($weight in $content) {
            foreach ($path in $weight.paths) {
                $weightUrl = $baseUrl + $path
                $weightDest = "public/models/" + $path
                Write-Host "Downloading weight $path..."
                Invoke-WebRequest -Uri $weightUrl -OutFile $weightDest
            }
        }
    } catch {
        Write-Host "Failed to process $manifest"
    }
}
