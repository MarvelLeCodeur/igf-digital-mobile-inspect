import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    content:{flexGrow:1,backgroundColor:'#f5f7fc'},
    body:{flexGrow:1,paddingHorizontal:'5%',paddingTop:34,paddingBottom:16},
    form:{width:'100%',maxWidth:500,alignSelf:'center',gap:21},
    icon:{marginBottom:7,backgroundColor:'#e5efff',height:72,width:72,borderRadius:24,alignItems:'center',justifyContent:'center'},
    title:{fontSize:23,fontWeight:'800',color:'#101f4b',textAlign:'center',letterSpacing:-.4},
    buttonLabel:{color:'#fff'},
    notice:{flexDirection:'row',alignItems:'flex-start',gap:8,backgroundColor:'#fff5e9',borderRadius:13,padding:10},
    message:{flexShrink:1,color:'#8a3c21',fontSize:13,lineHeight:19},
});
