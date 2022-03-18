# 안드로이드 APK 파일 추출 스크립트
cd ./android
./gradlew app:assembleRelease --stacktrace
cd ..
# cp ./android/app/build/outputs/apk/release/app-release.apk ~/Desktop/goodagent.apk