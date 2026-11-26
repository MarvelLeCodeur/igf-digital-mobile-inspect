import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    content:{width:'100%',maxWidth:560,alignSelf:'center',padding:16,paddingBottom:28,gap:12},
    hero:{padding:14,backgroundColor:'#e3efff',borderRadius:17,flexDirection:'row',alignItems:'center',gap:11},
    heroText:{flex:1,gap:4},
    icon:{height:43,width:43,borderRadius:12,backgroundColor:'#f5faff',justifyContent:'center',alignItems:'center'},
    title:{fontSize:19,fontWeight:'800',color:'#10224c'},
    subtitle:{color:'#365780',fontSize:13,lineHeight:18},
    body:{color:'#243d63',fontSize:14,lineHeight:21},
    field:{backgroundColor:'#f9fbff',borderRadius:14,borderColor:'#dce7f7',borderWidth:1,padding:10,gap:7},
    label:{color:'#163263',fontWeight:'800',fontSize:13},
    input:{backgroundColor:'#fff',borderWidth:1,borderColor:'#cddbf0',borderRadius:10,minHeight:45,paddingHorizontal:10,color:'#142952'},
    editor:{minHeight:104,textAlignVertical:'top',paddingTop:8},
    date:{fontSize:11,color:'#455f83'},
    message:{backgroundColor:'#f9fbff',borderRadius:13,padding:10,marginRight:24,gap:5},
    ownMessage:{backgroundColor:'#e5efff',marginRight:0,marginLeft:24},
    linkButton:{minHeight:38,justifyContent:'center'},
    link:{color:'#0757bc',fontWeight:'800',fontSize:13},
    navigation:{flexDirection:'row',gap:6,flexWrap:'wrap'},
});
