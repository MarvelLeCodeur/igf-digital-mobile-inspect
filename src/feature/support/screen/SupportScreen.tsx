import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { Redirect, useFocusEffect } from 'expo-router';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { dryMain } from '../../../dry-core/dry-service/dry-main.service';
import type { DryQueryResultsInterface } from '../../../dry-core/dry-model/dry-interface';
import { FormScrollView } from '../../../shared/component/FormScrollView';
import { MobileLayout } from '../../../shared/component/MobileLayout/MobileLayout';
import { RemixIcon } from '../../../shared/component/RemixIcon';
import { useToast } from '../../../shared/component/ToastProvider';
import { PrimaryAction, ScreenRow } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles } from './SupportScreen.styles';

interface Conversation {
    _id:string; subject:string; waitingFor:'inspecteur'|'superieur';
    messages?:{_id:string;body:string;author:string;role:'inspecteur'|'superieur';sentAt:string}[];
}

export function SupportScreen() {
    const {session} = useWorkspace();
    const toast = useToast();
    const [list,setList] = useState<DryQueryResultsInterface<Conversation>|null>(null);
    const [selected,setSelected] = useState<Conversation|null>(null);
    const [compose,setCompose] = useState(false);
    const [subject,setSubject] = useState('');
    const [body,setBody] = useState('');
    const [saving,setSaving] = useState(false);
    const [unavailable,setUnavailable] = useState(false);

    const load = useCallback(async (page=1) => {
        try {
            setList(await dryMain.getAll<DryQueryResultsInterface<Conversation>>({page,pageSize:20},'/support'));
            setUnavailable(false);
        } catch { setUnavailable(true); }
    },[]);
    useFocusEffect(useCallback(()=>{if(session)void load();},[session,load]));

    async function open(id:string,preserveDraft=false) {
        try {
            const {data}=await dryMain.getById<{data:Conversation}>(id,'/support');
            setCompose(false);
            if (!preserveDraft) setBody('');
            setSelected(data);
        } catch (cause) {toast('error',cause instanceof Error?cause.message:'Conversation indisponible.');}
    }

    async function send() {
        if (saving) return;
        if (body.trim().length < 5 || (!selected && subject.trim().length < 3)) {
            toast('warning','Précisez l’objet et votre question avant d’envoyer.');return;
        }
        setSaving(true);
        try {
            const {data}=await dryMain.create<{data:Conversation}>(
                selected ? {body:body.trim()} : {subject:subject.trim(),body:body.trim()},
                selected ? '/support/'+encodeURIComponent(selected._id)+'/messages' : '/support',
            );
            setSelected(data);
            setCompose(false);
            setSubject('');
            setBody('');
            toast('success','Votre message a été envoyé à la supervision.');
            void load();
        } catch(cause) {toast('error',cause instanceof Error?cause.message:'Impossible d’envoyer le message.');}
        finally {setSaving(false);}
    }

    if (!session) return <Redirect href="/login" />;
    const page=list?.meta.page ?? 1;
    const pages=list?.meta.totalPages ?? 0;
    function back() {setSelected(null);setCompose(false);setBody('');setSubject('');}

    return (
        <MobileLayout active="settings" title="Aide & assistance" back>
            <FormScrollView contentContainerStyle={styles.content}>
                <View style={styles.hero}>
                    <View style={styles.icon}><RemixIcon name="mail-line" size={24} color="#0757bc" /></View>
                    <View style={styles.heroText}><Text accessibilityRole="header" style={styles.title}>Écrire à un supérieur</Text>
                        <Text style={styles.subtitle}>Demandez une précision ou signalez un point que vous ne comprenez pas.</Text></View>
                </View>
                {compose || selected ? <>
                    <Pressable accessibilityRole="button" onPress={back} disabled={saving} style={styles.linkButton}>
                        <Text style={styles.link}>Retour aux conversations</Text>
                    </Pressable>
                    {selected ? <>
                        <Text accessibilityRole="header" style={styles.title}>{selected.subject}</Text>
                        {(selected.messages ?? []).map(message => <View key={message._id}
                            style={[styles.message,message.role==='inspecteur' && styles.ownMessage]}>
                            <Text style={styles.label}>{message.role==='inspecteur'?'Vous':message.author}</Text>
                            <Text selectable style={styles.body}>{message.body}</Text>
                            <Text style={styles.date}>{new Date(message.sentAt).toLocaleString('fr-FR')}</Text>
                        </View>)}
                        <Pressable accessibilityRole="button" onPress={()=>void open(selected._id,true)} style={styles.linkButton}>
                            <Text style={styles.link}>Actualiser la conversation</Text>
                        </Pressable>
                    </> : <View style={styles.field}><Text style={styles.label}>Objet</Text>
                        <TextInput accessibilityLabel="Objet" style={styles.input} editable={!saving} maxLength={100}
                            placeholder="Ex. Précision sur un justificatif" value={subject} onChangeText={setSubject} /></View>}
                    <View style={styles.field}><Text style={styles.label}>{selected?'Votre réponse':'Votre message'}</Text>
                        <TextInput accessibilityLabel={selected?'Votre réponse':'Votre message'} style={[styles.input,styles.editor]}
                            editable={!saving} maxLength={2000} multiline placeholder="Écrivez votre question…" value={body} onChangeText={setBody} />
                        <Text style={styles.date}>{body.length} / 2 000</Text>
                    </View>
                    <PrimaryAction label={saving?'Envoi…':'Envoyer'} disabled={saving} onPress={()=>void send()} />
                </> : <>
                    <PrimaryAction label="Nouveau message" onPress={()=>setCompose(true)} />
                    <Text accessibilityRole="header" style={styles.title}>Mes conversations</Text>
                    {unavailable ? <ScreenRow title="Chargement indisponible" subtitle="Appuyez pour réessayer" icon="refresh-line" onPress={()=>void load()} /> :
                        !list ? <ActivityIndicator color="#0757bc" /> : !list.data.length ? <Text style={styles.body}>Aucune conversation pour le moment.</Text> : null}
                    {list?.data.map(thread=><ScreenRow key={thread._id} title={thread.subject} icon="mail-line"
                        subtitle={thread.waitingFor==='superieur'?'En attente du supérieur':'Réponse du supérieur'} onPress={()=>void open(thread._id)} />)}
                    {pages > 1 ? <View style={styles.navigation}>
                        <PrimaryAction label="Précédente" disabled={page<=1} onPress={()=>void load(page-1)} />
                        <PrimaryAction label="Suivante" disabled={page>=pages} onPress={()=>void load(page+1)} />
                    </View> : null}
                </>}
            </FormScrollView>
        </MobileLayout>
    );
}
