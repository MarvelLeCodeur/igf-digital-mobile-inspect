import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    scroll:{flex:1,backgroundColor:'#f4f8ff'},
    // Le contenu remplit l’écran quand il est court et défile quand il est plus long.
    content:{flexGrow:1},
    sheet:{flexGrow:1,backgroundColor:'#f4f8ff',marginTop:-21,borderTopLeftRadius:32,borderTopRightRadius:32,
        paddingHorizontal:'5%',paddingTop:16,paddingBottom:8},
    inner:{flexGrow:1,width:'100%',maxWidth:510,alignSelf:'center',gap:12},
    welcome:{flexDirection:'row',alignItems:'center',gap:12,padding:14,borderRadius:19,backgroundColor:'#fff',
        borderWidth:1,borderColor:'#e0eaf8',shadowColor:'#153d76',shadowOffset:{width:0,height:4},shadowOpacity:.1,shadowRadius:10,elevation:3},
    heading:{flex:1,gap:5},
    title:{fontSize:21,fontWeight:'800',color:'#0f2450',letterSpacing:-.4},
    caption:{fontSize:13,lineHeight:19,color:'#405778'},
    panel:{backgroundColor:'#f7faff',borderColor:'#e0eaf8',borderWidth:1,borderRadius:14,overflow:'hidden'},
    panelHeader:{flexDirection:'row',alignItems:'center',gap:7,backgroundColor:'#e7effb',paddingHorizontal:12,paddingVertical:8},
    panelTitle:{fontWeight:'800',color:'#102450',fontSize:14},
    panelRow:{flexDirection:'row',justifyContent:'space-between',gap:10,paddingHorizontal:12,paddingVertical:6},
    value:{flexShrink:1,color:'#102450',fontWeight:'700',fontSize:13,textAlign:'right'},
    note:{padding:12},
    actions:{marginTop:'auto',paddingTop:10},
});
