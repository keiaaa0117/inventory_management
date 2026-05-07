@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM
@REM MAVEN_BATCH_PAUSE - set to 'on' to wait for a keystroke before ending
@REM MAVEN_BATCH_ECHO - set to 'on' to echo the batch commands
@REM
@REM SET MAVEN_OPTS=-Xdebug -Xrunjdwp:transport=dt_socket,server=y,suspend=y,address=8000

@echo off
setlocal enabledelayedexpansion

if not "%JAVA_HOME%" == "" goto OkJHome
for %%i in (java.exe) do set "JAVA_CMD=%%~$PATH:i"
if not "%JAVA_CMD%" == "" (
  set "JAVA_HOME=!JAVA_CMD:java.exe=!"
  set "JAVA_HOME=!JAVA_HOME:~0,-1!"
)
if "%JAVA_HOME%" == "" (
  echo.
  echo ERROR: JAVA_HOME is not set and no Java executable found in your PATH.
  echo.
  echo Please set the JAVA_HOME variable in your environment to match the
  echo location of your Java installation.
  goto error
)

:OkJHome
if exist "%JAVA_HOME%\bin\java.exe" goto init

echo.
echo ERROR: JAVA_HOME is pointing to a location where java.exe does not exist.
echo JAVA_HOME: "%JAVA_HOME%"
goto error

:init
setlocal
set MAVEN_CMD_LINE_ARGS=%*
if "%MAVEN_CMD_LINE_ARGS:~0,1%"=="""" (
  for /f "delims= " %%A in ('echo prompt $H ^| cmd') do set "BS=%%A"
  set "MAVEN_CMD_LINE_ARGS=!MAVEN_CMD_LINE_ARGS:*"="!"
)

set "MAVEN_JAVA_EXE=%JAVA_HOME%\bin\java.exe"
set MAVEN_HOME=%~dp0
if "%MAVEN_HOME:~-1%"=="\" set "MAVEN_HOME=%MAVEN_HOME:~0,-1%"

"%MAVEN_JAVA_EXE%" ^
  %MAVEN_OPTS% ^
  -classpath "%MAVEN_HOME%\.mvn\wrapper\maven-wrapper.jar" ^
  "-Dmaven.multiModuleProjectDirectory=%MAVEN_HOME%" ^
  org.apache.maven.wrapper.MavenWrapperMain %*

if ERRORLEVEL 1 goto error
goto end

:error
set ERROR_CODE=1

:end
@endlocal & set ERROR_CODE=%ERROR_CODE%
if not "%MAVEN_BATCH_PAUSE%"=="" pause
if "%ERRORLEVEL%"=="1" exit /b 1
exit /b 0
