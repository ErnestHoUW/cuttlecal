# cuttlecal
This is our Fourth Year Design Project

## C++ Setup
## CMake
1. Download the installer here
2. Make sure to check add to PATH for all users

## Install Visual Studio Build Tools
1. Install 
   https://visualstudio.microsoft.com/downloads/#build-tools-for-visual-studio-2022
2. Select C++ build tools

## vcpkg
2. Clone vcpkg in c:\
```
git clone https://github.com/Microsoftvcpkg.git
```
1. Install vcpkg
```
.\vcpkg\bootstrap-vcpkg.bat
```
1. Install dependencies
```
cd c++
vcpkg integrate install
```

## Install C++ Extensions on VSCode

- C/C++ Extension Pack
- CMake
- CMake Tools

## Configure Tool Chain
1. Press `ctrl+shift+p`
2. Open Preferences (json)
3. Add
```
   "cmake.configureSettings": {
        "CMAKE_TOOLCHAIN_FILE": "c:/vcpkg/scripts/buildsystems/vcpkg.cmake"
    }
```
## Select Compiler
1. Press `ctrl+shift+p`
2. Open CMake: Configure
3. Choose 
