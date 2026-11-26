import { Image, StyleSheet, View } from 'react-native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '../dry-module/dry-auth/context/AuthContext';

import { ToastProvider } from '../shared/component/ToastProvider';
import { NotificationInbox } from '../feature/notification/screen/NotificationInbox';

export default function RootLayout() {
    const [ready,error] = useFonts({RemixIcon:require('../../assets/fonts/remixicon.ttf')});
    if (!ready && !error) {
        return (
            <View style={styles.launch}>
                <Image source={require('../../assets/igf-logo-light.png')} style={styles.logo}
                    resizeMode="contain" accessibilityLabel="Inspection générale des finances" />
            </View>
        );
    }
    return (
        <SafeAreaProvider>
            <AuthProvider><NotificationInbox><ToastProvider>
                <Stack screenOptions={{headerShown:false,animation:'fade',contentStyle:styles.screen}}>
                    <Stack.Screen name="login" options={{animation:'none'}} />
                    <Stack.Screen name="(tabs)" options={{animation:'none'}} />
                </Stack>
            </ToastProvider></NotificationInbox></AuthProvider>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    screen:{backgroundColor:'#f5f7fc'},
    launch:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#16243e'},
    logo:{width:220,height:140},
});
