import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import type { PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { RemixIcon } from './RemixIcon';

const tones = {
    success:{title:'Enregistré',color:'#177047',tint:'#e5f6ec',icon:'checkbox-circle-fill'},
    warning:{title:'À vérifier',color:'#8d5500',tint:'#fff3dc',icon:'alarm-warning-line'},
    error:{title:'Une erreur est survenue',color:'#a3263b',tint:'#ffedf0',icon:'error-warning-line'},
} as const;
type Tone = keyof typeof tones;
type ShowToast = (tone:Tone,message:string)=>void;

const Toast = createContext<ShowToast>(()=>{});

export function ToastProvider({children}:PropsWithChildren) {
    const insets = useSafeAreaInsets();
    const [notice,setNotice] = useState<{tone:Tone;message:string}|null>(null);
    const timer = useRef<ReturnType<typeof setTimeout>|null>(null);
    const dismiss = useCallback(()=>{
        if(timer.current) clearTimeout(timer.current);
        timer.current = null;
        setNotice(null);
    },[]);
    const show = useCallback<ShowToast>((tone,message)=>{
        if(timer.current) clearTimeout(timer.current);
        setNotice({tone,message});
        timer.current = setTimeout(dismiss,tone === 'error' ? 7500 : 5500);
    },[dismiss]);
    useEffect(()=>()=>{if(timer.current)clearTimeout(timer.current);},[]);
    const style = notice ? tones[notice.tone] : null;
    return (
        <Toast.Provider value={show}>
            {children}
            {notice && style ? <View pointerEvents="box-none" style={[styles.overlay,{top:insets.top+9}]}>
                <View accessibilityLiveRegion={notice.tone==='error'?'assertive':'polite'} style={[styles.card,{borderColor:style.tint}]}>
                    <View style={[styles.icon,{backgroundColor:style.tint}]}><RemixIcon name={style.icon} color={style.color} size={22} /></View>
                    <View style={styles.content}>
                        <Text style={[styles.title,{color:style.color}]}>{style.title}</Text>
                        <Text style={styles.message}>{notice.message}</Text>
                    </View>
                    <Pressable accessibilityRole="button" accessibilityLabel="Fermer le message" onPress={dismiss} style={styles.close}>
                        <RemixIcon name="close-line" size={21} color="#446387" />
                    </Pressable>
                </View>
            </View> : null}
        </Toast.Provider>
    );
}

export const useToast = () => useContext(Toast);

const styles = StyleSheet.create({
    overlay:{position:'absolute',left:13,right:13,alignItems:'center',zIndex:50,elevation:50},
    card:{backgroundColor:'#fcfdff',width:'100%',maxWidth:510,borderWidth:1.5,borderRadius:17,padding:9,
        flexDirection:'row',alignItems:'center',gap:9,shadowColor:'#173765',shadowOffset:{width:0,height:5},shadowRadius:10,shadowOpacity:.17,elevation:8},
    icon:{width:39,height:39,borderRadius:12,alignItems:'center',justifyContent:'center'},
    content:{flex:1,gap:2},
    title:{fontSize:14,fontWeight:'800'},
    message:{color:'#203c63',fontSize:13,lineHeight:18},
    close:{width:40,height:40,borderRadius:10,alignItems:'center',justifyContent:'center'},
});
