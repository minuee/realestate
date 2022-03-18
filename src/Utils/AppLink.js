import { Linking, Platform } from 'react-native';

export const maybeOpenURL = async (
  url,
  { appName, appStoreId, appStoreLocale, playStoreId }
) => {
  Linking.openURL(url).catch(err => {
    if (err.code === 'EUNSPECIFIED') {
      if (Platform.OS === 'ios') {
        // check if appStoreLocale is set
        const locale = typeof appStoreLocale === 'undefined'
          ? 'us'
          : appStoreLocale;

        //Linking.openURL(`https://itunes.apple.com/${locale}/app/${appName}/id${appStoreId}`);
        Linking.openURL(`https://itunes.apple.com/app/id${appStoreId}`);
      } else {
        Linking.openURL(
          'https://play.google.com/store/apps/details?id=' + playStoreId
        );
      }
    } else {
      throw new Error(`Could not open ${appName}. ${err.toString()}`);
    }
  });
};

export const openInStore = async ({ appName, appStoreId, appStoreLocale, playStoreId }) => {  
  if (Platform.OS === 'ios') {    
    const supported = await Linking.canOpenURL(`itms-apps://itunes.apple.com/kr/app/id${appStoreId}?mt=8`); 
    if (supported) { // 설치되어 있으면
      Linking.openURL(`itms-apps://itunes.apple.com/kr/app/id${appStoreId}?mt=8`);
    } else { // 앱이 없으면
      Linking.openURL(`https://apps.apple.com/kr/app/%EC%B0%A9%ED%95%9C%EB%B6%80%EB%8F%99%EC%82%B0/id${appStoreId}`);
    }    
  } else {
    const supported2 = await Linking.canOpenURL('market://details?id=' + playStoreId); 
    if (supported2) { // 설치되어 있으면
      Linking.openURL('market://details?id=' + playStoreId);
    }else{
      Linking.openURL('https://play.google.com/store/apps/details?id=' + playStoreId);
    }
  }
}

export default { maybeOpenURL, openInStore};

/* in use
import AppLink from 'react-native-app-link';

AppLink.maybeOpenURL(url, { appName, appStoreId, appStoreLocale, playStoreId }).then(() => {
  // do stuff
})
.catch((err) => {
  // handle error
});

AppLink.openInStore({ appName, appStoreId, appStoreLocale, playStoreId }).then(() => {
  // do stuff
})
.catch((err) => {
  // handle error
});

*/