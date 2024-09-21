# Save the current directory
$originalDir = Get-Location

try {
    # Navigate to the Server directory and start the server
    Write-Host "Navigating to the Server directory and starting the server..."
    cd ./Server
    Start-Process "npm" "start"

    # Navigate to the Client directory and start the client development server
    Write-Host "Navigating to the Client directory and starting the client development server..."
    cd ../Client
    Start-Process "npm" "run dev"

    Write-Host "Server and client development server started successfully."
} catch {
    Write-Error "An error occurred: $_"
} finally {
    # Return to the original directory
    cd $originalDir
}