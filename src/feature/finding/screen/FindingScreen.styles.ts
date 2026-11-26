import { StyleSheet } from 'react-native';

const navy = '#102550';
const muted = '#425b7f';
const blue = '#075cc5';
const border = '#dce6f5';
const shadow = {shadowColor:'#233e6c',shadowOpacity:.10,shadowOffset:{width:0,height:3},shadowRadius:6,elevation:2};

export const styles = StyleSheet.create({
    content:{width:'100%',maxWidth:560,alignSelf:'center',paddingHorizontal:16,paddingTop:10,paddingBottom:24,gap:12},
    hero:{minHeight:98,borderRadius:18,backgroundColor:'#0755b2',backgroundImage:'linear-gradient(125deg, #074aa7 0%, #137bc4 100%)',
        flexDirection:'row',alignItems:'center',gap:13,padding:15,...shadow},
    heroIcon:{width:45,height:45,borderRadius:13,backgroundColor:'#ffffff25',alignItems:'center',justifyContent:'center'},
    heroText:{flex:1,gap:3},
    title:{fontSize:22,fontWeight:'800',color:'#fff',letterSpacing:-.35},
    subtitle:{color:'#edf6ff',fontSize:13,lineHeight:18},
    sectionTitle:{color:navy,fontSize:16,fontWeight:'800',marginTop:5},
    card:{backgroundColor:'#fbfdff',borderWidth:1,borderColor:border,borderRadius:15,padding:11,gap:10,...shadow},
    cardHeading:{flexDirection:'row',alignItems:'flex-start',gap:10},
    missionIcon:{width:42,height:42,borderRadius:11,backgroundColor:'#e8f2ff',alignItems:'center',justifyContent:'center'},
    missionDetails:{flex:1,gap:3},
    reference:{color:blue,fontSize:11,fontWeight:'800'},
    missionTitle:{fontSize:15,lineHeight:20,fontWeight:'800',color:navy},
    entity:{flexDirection:'row',alignItems:'center',gap:5},
    support:{color:muted,fontSize:12,lineHeight:17,flexShrink:1},
    cardFooter:{borderTopWidth:1,borderTopColor:'#e9eff8',paddingTop:8,flexDirection:'row',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:5},
    badge:{flexDirection:'row',alignItems:'center',gap:5,backgroundColor:'#e8f7ee',borderRadius:7,paddingHorizontal:7,paddingVertical:4},
    dot:{width:6,height:6,borderRadius:3,backgroundColor:'#228546'},
    badgeText:{color:'#166439',fontSize:11,fontWeight:'700'},
    cardAction:{flexDirection:'row',alignItems:'center',gap:3},
    link:{color:blue,fontWeight:'800',fontSize:13},
    pressed:{opacity:.76},
    errorPanel:{flexDirection:'row',alignItems:'center',gap:8,flexWrap:'wrap',backgroundColor:'#fff3f5',padding:11,borderRadius:12},
    error:{color:'#a02330',flex:1,fontSize:13,lineHeight:18},
    retry:{minHeight:40,justifyContent:'center',paddingHorizontal:6},
    empty:{alignItems:'center',gap:8,backgroundColor:'#fbfdff',borderWidth:1,borderColor:border,borderRadius:15,padding:18},
    emptyTitle:{color:navy,fontSize:15,fontWeight:'800',textAlign:'center'},
    center:{textAlign:'center'},
    pages:{flexDirection:'row',alignItems:'center',justifyContent:'center',gap:12,marginTop:3},
    pageButton:{width:44,height:44,alignItems:'center',justifyContent:'center',borderRadius:10,backgroundColor:'#e8f2ff'},
    disabled:{opacity:.4},
});
