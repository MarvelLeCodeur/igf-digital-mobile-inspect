import { Image, useWindowDimensions, View } from 'react-native';
import { useState } from 'react';
import { styles } from './MobileHero.styles';

// La fenêtre affiche uniquement l’illustration du téléphone sur la planche fournie.
export function MobileHero() {
    const [width,setWidth] = useState(0);
    const scale = width / 290;
    return (
        <View style={[styles.viewport,width > 0 && {height:Math.max(120,Math.min(280,width*.40))}]} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
            {width > 0 ? <Image source={require('../../../../assets/hero-reference.png')} resizeMode="stretch"
                accessible={false} style={[styles.image,{width:1672*scale,height:941*scale,left:-59*scale,top:-323*scale}]} /> : null}
        </View>
    );
}

export function RdcRibbon({ height: fixedHeight }: { height?: number } = {}) {
    const {width} = useWindowDimensions();
    const height = fixedHeight ?? Math.max(54,Math.min(110,Math.round(width*.17)));
    return <Image source={require('../../../../assets/rdc-ribbon.png')} style={[styles.ribbon,{height}]}
        resizeMode="stretch" accessible={false} />;
}
