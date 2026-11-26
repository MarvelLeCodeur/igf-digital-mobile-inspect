import { FormScrollView } from '../../../shared/component/FormScrollView';
import { Pressable, Text, View } from 'react-native';
import { router } from 'expo-router';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { styles as form } from './LoginScreen.styles';
import { styles } from './ForgotPasswordScreen.styles';

export function ForgotPasswordScreen() {
    return (
        <MobileLayout active="home" showTabs={false} title="IGF Inspect">
            <FormScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.content}>
                <View style={styles.body}>
                    <View style={styles.form}>
                        <View style={form.heading}>
                            <View style={styles.icon}><RemixIcon name="lock-line" color="#1855a1" size={36} /></View>
                            <Text accessibilityRole="header" style={styles.title}>Mot de passe oublié ?</Text>
                            <Text style={form.subtitle}>Contactez l’administrateur de votre application pour réinitialiser votre mot de passe. Indiquez-lui votre matricule ou votre adresse professionnelle.</Text>
                        </View>
                        <Pressable style={({pressed}) => [form.help,pressed && form.pressed]} accessibilityRole="link" onPress={() => router.replace('/login')}>
                            <Text style={form.link}>Retour à la connexion</Text>
                        </Pressable>
                    </View>
                </View>
            </FormScrollView>
        </MobileLayout>
    );
}
