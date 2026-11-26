import { useEffect, useState } from 'react';
import { useToast } from '../../../shared/component/ToastProvider';
import { FormScrollView } from '../../../shared/component/FormScrollView';
import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { Image, Keyboard, Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import type { IconName } from '../../../shared/component/RemixIcon';
import { PrimaryAction, ScreenRow } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles as ui } from '../../../shared/component/ScreenElements/ScreenElements.styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import { findingCategories } from '../finding.constants';
import { severities } from '../../mission/mission.constants';
import { useFindingDraftScreen } from './useFindingDraftScreen';
import { styles } from './FindingDraftScreen.styles';

const titles = ['Créer un constat','Détail du constat','Pièces justificatives','Ajouter une preuve','Relecture & Signature'];

export function FindingDraftScreen() {
    const { missionId } = useLocalSearchParams<{missionId?:string}>();
    const state = useFindingDraftScreen();
    const [openField,setOpenField] = useState<string | null>(null);
    const toast = useToast();
    const {workspace,step,setStep} = state;
    const error = state.error || workspace.error;
    useEffect(() => {
        if (error) toast('error',error);
    },[error,toast]);
    useEffect(() => {
        if (state.saved) toast('success',workspace.feedback || 'Le constat a été enregistré.');
    },[state.saved,workspace.feedback,toast]);
    if (!workspace.session) return <Redirect href="/login" />;
    const {selected,findingTitle,setFindingTitle,findingText,setFindingText,severity,setSeverity,busy} = workspace;
    if (!missionId || !selected || selected._id !== missionId) return <Redirect href="/findings" />;

    return (
        <MobileLayout active="findings" title="IGF Inspect">
            <FormScrollView contentContainerStyle={styles.content}>
                <View style={styles.heading}>
                    <View style={styles.headingRow}>
                        <Pressable accessibilityRole="button" accessibilityLabel="Retour" disabled={state.sending} style={styles.back}
                            onPress={() => {
                                if (step > 0 && !state.saved && !state.record) setStep(step === 2 ? 0 : 2);
                                else if (router.canGoBack()) router.back();
                                else router.replace('/findings');
                            }}>
                            <RemixIcon name="arrow-left-s-line" color="#123875" size={25} />
                        </Pressable>
                        <Text accessibilityRole="header" style={styles.title}>{titles[step]}</Text>
                    </View>
                    <Text style={styles.subtitle}>{step === 0 ? 'Renseignez les informations du constat sur le terrain' : selected.title}</Text>
                </View>
                <View style={styles.progress}>
                    <View style={styles.progressLine} />
                    {['Informations','Pièces jointes','Validation'].map((item,index) => {
                        const current = index === (step < 2 ? 0 : step < 4 ? 1 : 2);
                        return <View key={item} style={styles.step} accessible accessibilityLabel={(index + 1) + '. ' + item}
                            accessibilityState={{selected:current}}>
                            <View style={[styles.number,current && styles.current]}>
                                <Text style={[styles.numberText,current && styles.currentNumber]}>{index+1}</Text>
                            </View>
                            <Text style={[styles.stepLabel,current && styles.currentLabel]}>{item}</Text>
                        </View>;
                    })}
                </View>
                {state.saved ? <>
                    <ScreenRow title="Constat enregistré" subtitle={selected?.title} icon="checkbox-circle-line" color="#218449" />
                    <PrimaryAction label="Retour aux missions" onPress={() => router.navigate('/missions')} />
                </> : state.record ? <>
                    <ScreenRow title="Constat enregistré" subtitle={selected.title} icon="clipboard-line" />
                    <Text accessibilityLiveRegion="polite" style={ui.body}>{state.sending
                        ? 'Dépôt des pièces en cours…' : state.files.length+' pièce(s) restent à déposer.'}</Text>
                    {error ? <Text accessibilityRole="alert" style={ui.danger}>{error}</Text> : null}
                    {state.files.map((file,index)=><ScreenRow key={file.uri+index} title={file.name} icon="file-text-line" />)}
                    <PrimaryAction label="Reprendre le dépôt des pièces" disabled={state.sending} onPress={()=>void state.submit(false)} />
                </> : selected.status !== 'EN_COURS' || !selected.workPermissions?.createFinding ? <>
                    <Text style={ui.body}>Choisissez une mission en cours sur laquelle vous pouvez créer un constat.</Text>
                    <PrimaryAction label="Choisir une mission" onPress={() => router.navigate('/findings')} />
                </> : <>
                    {step===0 ? <>
                        <View style={styles.card}>
                            <DraftField label="Catégorie" icon="price-tag-3-line">
                                <SelectField label="Catégorie" placeholder="Sélectionner une catégorie" items={findingCategories} selected={state.category}
                                    open={openField === 'category'} close={() => setOpenField(null)} toggle={() => setOpenField(openField === 'category' ? null : 'category')}
                                    select={value => { state.setCategory(value); setOpenField(null); }} />
                            </DraftField>
                            <DraftField label="Description" icon="file-text-line">
                                <TextInput accessibilityLabel="Description" placeholder="Décrivez le constat observé…" placeholderTextColor="#42577e"
                                    maxLength={500} value={findingText} onChangeText={setFindingText} multiline style={[styles.control,styles.editor]} />
                                <Text style={styles.counter}>{findingText.length} / 500</Text>
                            </DraftField>
                            <DraftField label="Sévérité" icon="alarm-warning-line" warning>
                                <SelectField label="Sévérité" placeholder="Sélectionner la sévérité" items={severities} selected={severity ?? ''}
                                    open={openField === 'severity'} close={() => setOpenField(null)} toggle={() => setOpenField(openField === 'severity' ? null : 'severity')}
                                    select={value => { setSeverity(severities.find(item => item.value === value)?.value ?? null); setOpenField(null); }} />
                            </DraftField>
                            <DraftField label="Lieu" icon="map-pin-line">
                                <View style={styles.location}>
                                    <TextInput accessibilityLabel="Lieu" placeholder="Renseigner le lieu (site, zone, etc.)" placeholderTextColor="#42577e"
                                        value={state.location} onChangeText={state.setLocation} maxLength={140} style={styles.locationInput} />
                                    <RemixIcon name="focus-3-line" color="#123f91" size={21} />
                                </View>
                            </DraftField>
                        </View>
                        <Pressable accessibilityRole="button" style={({pressed}) => [styles.next,pressed && styles.pressed]}
                            onPress={() => {
                                if (!state.category || !severity || findingText.trim().length < 10) {
                                    toast('warning','Choisissez une catégorie et une sévérité, puis décrivez le constat en au moins 10 caractères.');
                                    return;
                                }
                                // On prépare le titre à partir de la description. Il reste modifiable à la validation.
                                if (!findingTitle.trim()) setFindingTitle(findingText.trim().replace(/\s+/g,' ').slice(0,80));
                                setStep(2);
                            }}>
                            <Text style={styles.nextLabel}>Suivant</Text>
                            <RemixIcon name="arrow-right-s-line" size={26} color="#fff" />
                        </Pressable>
                    </> : null}
                    {step===2 ? <>
                        <Text style={[ui.body,ui.center]}>{state.files.length} élément(s) ajouté(s)</Text>
                        {state.files.map((file,index) => <ScreenRow key={file.uri+index} title={file.name} subtitle={file.type}
                            icon={file.type==='document' ? 'file-text-line' : 'image-line'} onPress={() => state.setFiles(items=>items.filter((_,position)=>position!==index))} />)}
                        {state.files.length ? <Text style={styles.warning}>Les pièces seront déposées avec le constat lors de l’enregistrement.</Text> : null}
                        <PrimaryAction label="Ajouter une pièce justificative" onPress={() => setStep(3)} />
                        <PrimaryAction label="Suivant" onPress={() => setStep(4)} />
                    </> : null}
                    {step===3 ? <>
                        <ScreenRow title="Prendre une photo" icon="image-line" onPress={() => void state.pick('photo')} />
                        <ScreenRow title="Importer un scan" icon="scan-2-line" onPress={() => void state.pick('scan')} />
                        <ScreenRow title="Importer un fichier" icon="upload-2-line" onPress={() => void state.pick('document')} />
                        {state.preview ? <>
                            {state.preview.type==='document' ? <ScreenRow title={state.preview.name} icon="file-text-line" /> :
                                <Image source={{uri:state.preview.uri}} style={styles.preview} resizeMode="contain" />}
                            <PrimaryAction label="Ajouter à l’aperçu" onPress={state.add} />
                            <PrimaryAction label="Supprimer l’aperçu" onPress={() => state.setPreview(null)} />
                        </> : null}
                    </> : null}
                    {step===4 ? <>
                        <ScreenRow title="Mission" subtitle={selected.title} icon="file-text-line" />
                        <Text style={ui.section}>Intitulé du constat</Text>
                        <TextInput accessibilityLabel="Intitulé du constat" editable={!state.sending} value={findingTitle} onChangeText={setFindingTitle}
                            maxLength={250} style={ui.formField} />
                        <ScreenRow title="Sévérité" subtitle={severities.find(item=>item.value===severity)?.label} icon="alarm-warning-line" />
                        <ScreenRow title="Lieu" subtitle={state.location.trim() || 'Non renseigné'} icon="government-line" />
                        <ScreenRow title="Pièces justificatives" subtitle={state.files.length+' pièce(s) à déposer'} icon="image-line" onPress={() => { if (!state.sending) setStep(2); }} />
                        <Text style={ui.section}>Signature électronique</Text>
                        <Text style={ui.body}>La signature institutionnelle n’est pas encore disponible.</Text>
                        <PrimaryAction label="Enregistrer en brouillon" disabled={busy || state.sending || findingTitle.trim().length < 5} onPress={() => void state.submit(false)} />
                        <PrimaryAction label="Soumettre le constat" disabled={busy || state.sending || findingTitle.trim().length < 5} onPress={() => void state.submit(true)} />
                    </> : null}
                </>}
            </FormScrollView>
        </MobileLayout>
    );
}


function DraftField({label,icon,warning,children}:{
    label:string; icon:IconName; warning?:boolean; children:React.ReactNode;
}) {
    return <View style={styles.field}>
        <View style={[styles.fieldIcon,warning && styles.warningIcon]}>
            <RemixIcon name={icon} size={25} color={warning ? '#d41723' : '#0759da'} />
        </View>
        <View style={styles.fieldBody}>
            <Text style={styles.fieldLabel}>{label}</Text>
            {children}
        </View>
    </View>;
}

function SelectField({label,placeholder,items,selected,open,toggle,close,select}:{
    label:string; placeholder:string; items:readonly {value:string;label:string}[]; selected:string;
    open:boolean; toggle:()=>void; close:()=>void; select:(value:string)=>void;
}) {
    return <View>
        <Pressable accessibilityRole="button" accessibilityLabel={label} accessibilityState={{expanded:open}}
            onPress={() => { Keyboard.dismiss(); toggle(); }} style={[styles.control,styles.select]}>
            <Text style={[styles.selectText,selected && styles.selectedText]}>{items.find(item => item.value === selected)?.label ?? placeholder}</Text>
            <RemixIcon name="arrow-down-s-line" color="#294770" size={21} />
        </Pressable>
        <Modal visible={open} transparent animationType="slide" onRequestClose={close}>
            <View style={styles.sheetOverlay}>
                <Pressable accessibilityRole="button" accessibilityLabel="Fermer la sélection" style={styles.sheetBackdrop} onPress={close} />
                <SafeAreaView edges={['bottom']} style={styles.sheet} accessibilityViewIsModal>
                    <View style={styles.sheetHandle} accessible={false} />
                    <View style={styles.sheetHeader}>
                        <Text accessibilityRole="header" style={styles.sheetTitle}>{label}</Text>
                        <Pressable accessibilityRole="button" accessibilityLabel="Fermer" onPress={close} style={styles.sheetClose}>
                            <RemixIcon name="close-line" color="#294770" size={23} />
                        </Pressable>
                    </View>
                    <ScrollView keyboardShouldPersistTaps="handled" style={styles.sheetList}>
                        {items.map(item => <Pressable key={item.value} accessibilityRole="radio"
                            accessibilityState={{checked:item.value === selected}} onPress={() => select(item.value)}
                            style={[styles.option,item.value === selected && styles.optionSelected]}>
                            <Text style={[styles.selectText,item.value === selected && styles.selectedText]}>{item.label}</Text>
                            {item.value === selected ? <RemixIcon name="check-line" size={20} color="#075ed5" /> : null}
                        </Pressable>)}
                    </ScrollView>
                </SafeAreaView>
            </View>
        </Modal>
    </View>;
}
