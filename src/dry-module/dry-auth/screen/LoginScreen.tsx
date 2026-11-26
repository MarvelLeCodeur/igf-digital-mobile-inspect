import { FormScrollView } from '../../../shared/component/FormScrollView';
import { ActivityIndicator, Image, Keyboard, Pressable, Text, TextInput, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { useRef, useState } from 'react';
import type { ComponentRef } from 'react';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { useWorkspace } from '../context/AuthContext';
import { ConnectionTransition } from './ConnectionTransition';
import { styles } from './LoginScreen.styles';

export function LoginScreen() {
    const state = useWorkspace();
    const [viewport,setViewport] = useState(0);
    const [formHeight,setFormHeight] = useState(0);
    const [visible,setVisible] = useState(false);
    const [focused,setFocused] = useState<'username'|'password'|null>(null);
    const passwordField = useRef<ComponentRef<typeof TextInput>>(null);
    const canConnect = !state.busy && !!state.username.trim() && !!state.password;
    const ribbonHeight = viewport > 0 && viewport < 510 ? 30 : 39;
    // Donner d'abord la place aux champs et aux boutons, puis ajuster la photo.
    const heroHeight = viewport && formHeight
        ? Math.max(30, Math.min(185, Math.floor(viewport - formHeight - ribbonHeight - 16)))
        : 115;

    function submit() {
        if (canConnect) {
            void state.connect();
        }
    }
    if (state.session) return <><ConnectionTransition /><Redirect href="/" /></>;
    return (
        <MobileLayout active="home" showTabs={false} title="IGF Inspect">
            <View style={styles.loginLayout} onLayout={event => setViewport(event.nativeEvent.layout.height)}>
                <View style={[styles.hero,{height:heroHeight}]}>
                    <Image source={require('../../../../assets/inspect-login-hero.jpg')}
                        style={styles.heroPhoto} resizeMode="cover" accessible={false} />
                    <Image source={require('../../../../assets/inspect-login-curve.png')}
                        style={[styles.heroCurve,{height:Math.min(46,Math.round(heroHeight * .28))}]} resizeMode="stretch" accessible={false} />
                </View>
                {/* Seul le formulaire defile. La photo reste au-dessus du clavier. */}
                <FormScrollView contentContainerStyle={styles.scroll}>
                    <View style={[styles.sheet,styles.fittedSheet]}>
                        <View style={[styles.form,styles.fittedForm]} onLayout={event => setFormHeight(event.nativeEvent.layout.height)}>
                            <View style={styles.heading}>
                                <Text accessibilityRole="header" style={[styles.title,styles.fittedTitle]}>Connexion</Text>
                                <Text style={styles.subtitle}>Accédez à votre espace inspecteur</Text>
                            </View>
                            {state.error ? <View style={styles.errorBox}>
                                <RemixIcon name="error-warning-line" size={19} color="#a3202c" />
                                <Text accessibilityRole="alert" style={styles.error}>{state.error}</Text>
                            </View> : null}
                            <>
                                <View style={styles.fieldGroup}>
                                    <View style={[styles.field,styles.fittedField,focused === 'username' && styles.fieldFocused]}>
                                        <View style={styles.fieldIcon}><RemixIcon name="mail-line" color="#1855a1" size={19} /></View>
                                        <TextInput style={[styles.input,styles.fittedInput]} accessibilityLabel="Nom complet, matricule ou e-mail"
                                            placeholder="Nom, matricule ou e-mail" placeholderTextColor="#607394"
                                            value={state.username} onChangeText={state.setUsername} autoCapitalize="none" autoCorrect={false} autoComplete="username"
                                            onFocus={() => setFocused('username')} onBlur={() => setFocused(null)}
                                            returnKeyType="next" submitBehavior="submit" onSubmitEditing={() => passwordField.current?.focus()} />
                                    </View>
                                </View>
                                <View style={styles.fieldGroup}>
                                    <View style={[styles.field,focused === 'password' && styles.fieldFocused]}>
                                        <View style={styles.fieldIcon}><RemixIcon name="lock-line" color="#1855a1" size={19} /></View>
                                        <TextInput ref={passwordField} style={styles.input} accessibilityLabel="Mot de passe"
                                            placeholder="Mot de passe" placeholderTextColor="#607394" value={state.password}
                                            onChangeText={state.setPassword} secureTextEntry={!visible} autoComplete="current-password"
                                            onFocus={() => setFocused('password')} onBlur={() => setFocused(null)}
                                            returnKeyType="go" onSubmitEditing={submit} />
                                        <Pressable style={({pressed}) => [styles.reveal,pressed && styles.pressed]} accessibilityRole="button"
                                            accessibilityLabel={visible ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                                            onPress={() => setVisible(!visible)}>
                                            <RemixIcon name={visible ? 'eye-off-line' : 'eye-line'} color="#355681" size={19} />
                                        </Pressable>
                                    </View>
                                </View>
                                <Pressable accessibilityRole="checkbox" accessibilityState={{ checked:state.remember }}
                                    onPress={() => state.setRemember(!state.remember)} style={styles.remember}>
                                    <View style={[styles.checkbox,state.remember && styles.checked]}>
                                        {state.remember ? <RemixIcon name="check-line" color="#fff" size={17} /> : null}
                                    </View>
                                    <Text style={styles.rememberText}>Se souvenir de moi</Text>
                                </Pressable>
                                <LoginButton label={state.busy ? 'Connexion…' : 'Se connecter'} busy={state.busy} disabled={!canConnect} onPress={submit} />
                            </>
                            
                            
                            <Pressable style={({pressed}) => [styles.help,styles.fittedHelp,pressed && styles.pressed]} accessibilityRole="link"
                                onPress={() => router.push('/forgot-password')}>
                                <Text style={styles.link}>Mot de passe oublié ?</Text>
                            </Pressable>
                        </View>
                    </View>
                    <Image source={require('../../../../assets/inspect-login-footer.png')}
                        style={[styles.footer,{height:ribbonHeight}]} resizeMode="stretch" accessible={false} />
                </FormScrollView>
            </View>
        </MobileLayout>
    );
}

function LoginButton({label,onPress,disabled,busy=false,secondary=false}:{
    label:string; onPress:()=>void; disabled:boolean; busy?:boolean; secondary?:boolean;
}) {
    const color = secondary ? '#174e8c' : '#fff';
    return (
        <Pressable accessibilityRole="button" accessibilityState={{disabled,busy}} disabled={disabled} onPress={onPress}
            style={({pressed}) => [styles.button,styles.fittedButton,secondary && styles.secondary,disabled && styles.disabled,pressed && styles.pressed]}>
            <Text style={[styles.buttonLabel,{color}]}>{label}</Text>
            <View style={styles.buttonIcon}>
                {busy ? <ActivityIndicator size="small" color={color} /> : <RemixIcon name="arrow-right-s-line" size={21} color={color} />}
            </View>
        </Pressable>
    );
}
