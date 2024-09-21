# Save the current directory
$originalDir = Get-Location

try {
    # Navigate to the Server directory and install the server dependencies
    Write-Host "Navigating to the Server directory and installing dependencies..."
    cd ./Server
    npm install

    # Navigate to the Client directory and install the client dependencies
    Write-Host "Navigating to the Client directory and installing dependencies..."
    cd ../Client
    npm install

    # Navigate back to the Server directory
    Write-Host "Navigating back to the Server directory..."
    cd ../Server

    # Check if .env file already exists
    if (-Not (Test-Path -Path .env)) {
        # Create .env file in the Server directory
        Write-Host "Creating .env file in the Server directory..."
        New-Item -Path . -Name .env -ItemType file
    } else {
        Write-Host ".env file already exists in the Server directory."
    }

    Write-Host "Installation and setup completed successfully."
} catch {
    Write-Error "An error occurred: $_"
} finally {
    # Return to the original directory
    cd $originalDir
}