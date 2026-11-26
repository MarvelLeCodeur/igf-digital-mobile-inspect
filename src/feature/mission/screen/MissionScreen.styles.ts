import { StyleSheet } from 'react-native';
import { colors } from '../../../constants/theme';

export const styles = StyleSheet.create({
    body:{ flex:1, padding:18 },
    card:{ borderWidth:1, borderColor:colors.border, backgroundColor:colors.surface, padding:18, gap:9, borderRadius:14, marginBottom:10 },
    title:{ color:colors.navy, fontSize:18, fontWeight:'700' },
    text:{ color:colors.navy, lineHeight:22 },
    error:{ color:'#992b21', backgroundColor:'#fdebe9', borderRadius:8, padding:12, marginBottom:12 },
    label:{ color:colors.navy, fontWeight:'600' },
    form:{ gap:10, paddingVertical:12, borderTopWidth:1, borderTopColor:colors.border },
    choices:{ flexDirection:'row', flexWrap:'wrap', gap:8 },
    choice:{ minHeight:44, paddingHorizontal:12, borderWidth:1, borderRadius:8, borderColor:colors.border, justifyContent:'center' },
    choiceActive:{ backgroundColor:'#e8eef9', borderColor:colors.blue },
    input:{ borderWidth:1, borderColor:'#8392ac', color:colors.navy, minHeight:48, paddingHorizontal:12, borderRadius:8 },
    toolbar:{ flexDirection:'row', alignItems:'center', flexWrap:'wrap', justifyContent:'space-between', gap:8, marginBottom:12 },
    link:{ color:colors.blue, fontWeight:'600', paddingVertical:8 },
    status:{ color:colors.blue, fontSize:12, fontWeight:'700' },
});
