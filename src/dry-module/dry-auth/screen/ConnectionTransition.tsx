import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

export function ConnectionTransition() {
    return (
        <View style={styles.surface}>
            <Image source={require('../../../../assets/igf-logo.png')} style={styles.logo} resizeMode="contain"
                accessibilityLabel="Inspection générale des finances" />
            <View style={styles.status}>
                <ActivityIndicator color="#075bb8" />
                <Text accessibilityLiveRegion="polite" style={styles.label}>Ouverture de votre espace…</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    surface:{flex:1,alignItems:'center',justifyContent:'center',backgroundColor:'#f5f7fc',padding:24,gap:18},
    logo:{width:170,height:100},
    status:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:8},
    label:{color:'#29456f',fontSize:14,fontWeight:'600',flexShrink:1},
});
