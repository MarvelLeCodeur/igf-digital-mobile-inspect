import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
    content:{padding:16,gap:16},
    month:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',minHeight:42},
    week:{flexDirection:'row',justifyContent:'space-between'},
    date:{minWidth:36,minHeight:48,justifyContent:'center',alignItems:'center',gap:3,borderRadius:22},
    selected:{backgroundColor:'#075bc7'},
    text:{fontSize:13,color:'#17376a'},
    white:{color:'#fff'},
    title:{color:'#102650',fontSize:17,fontWeight:'800',textTransform:'capitalize'},
    note:{color:'#36547a',lineHeight:21,paddingVertical:10},
});
