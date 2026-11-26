import { useEffect, useRef, useState } from 'react';
import { Text, TextInput, View } from 'react-native';
import { FilterChips, PrimaryAction } from '../../../shared/component/ScreenElements/ScreenElements';
import { styles } from '../../../shared/component/ScreenElements/ScreenElements.styles';
import { readQuestionnaire, writeQuestionnaire } from '../service/questionnaire.service';
import type { Answer, Questionnaire, Sample } from '../service/questionnaire.service';

const choices = [{value:'OUI',label:'Oui'},{value:'NON',label:'Non'},{value:'NON_VERIFIE',label:'Non vérifié'}];
const outcomes = [{value:'CONFORME',label:'Conforme'},{value:'ECART',label:'Écart'},{value:'NON_VERIFIE',label:'Non vérifié'}];
const statuses:Record<string,string> = {BROUILLON:'Brouillon',EN_REVUE:'En revue',A_CORRIGER:'À corriger',VALIDE:'Validé'};
interface SampleField extends Sample { key:number }

export function MissionQuestionnaire({missionId}:{missionId:string}) {
    const [view,setView] = useState<Questionnaire|null>(null);
    const [expanded,setExpanded] = useState(false);
    const [answers,setAnswers] = useState<Record<string,Answer>>({});
    const [samples,setSamples] = useState<SampleField[]>([]);
    const [error,setError] = useState('');
    const [feedback,setFeedback] = useState('');
    const [busy,setBusy] = useState(false);
    const revision = useRef(0);
    const pending = useRef(false);
    const nextKey = useRef(0);

    function apply(result:Questionnaire) {
        setView(result);
        setAnswers(Object.fromEntries((result.data?.answers ?? []).map(answer=>[answer.questionId,answer])));
        setSamples((result.data?.samples ?? []).map(sample=>({...sample,key:nextKey.current++})));
    }

    useEffect(() => {
        const active = ++revision.current;
        void readQuestionnaire(missionId).then(data=>{
            if (active === revision.current) apply(data);
        }).catch(()=>{ /* La fiche de simulation est masquée si elle est indisponible. */ });
        return () => { revision.current++; pending.current=false; };
    },[missionId]);

    if (!view) return null;

    async function reload() {
        if (pending.current) return;
        pending.current = true;
        const active = ++revision.current;
        setBusy(true);
        setError('');
        try {
            const result = await readQuestionnaire(missionId);
            if (active === revision.current) apply(result);
        } catch {
            if (active === revision.current) setError('La fiche ne peut pas être rechargée.');
        } finally {
            if (active === revision.current) {
                pending.current = false;
                setBusy(false);
            }
        }
    }

    async function save(submit:boolean) {
        if (!view?.editable || pending.current) return;
        const fields = samples.map(({key,...sample})=>({...sample,
            reference:sample.reference.trim(),evidenceReference:sample.evidenceReference?.trim() || undefined,
        }));
        if (submit && view.template.questions.some(question=>question.required && !answers[question.id]?.response)) {
            setError('Réponds aux questions obligatoires.');
            return;
        }
        if (fields.some(row=>!row.reference) || (submit && !fields.length)) {
            setError('Renseigne les références et ajoute au moins une vérification avant de soumettre.');
            return;
        }
        if (submit && fields.some(row=>row.outcome==='ECART' && (!row.evidenceReference || !row.comment?.trim()))) {
            setError('Chaque écart doit avoir un commentaire et une référence de preuve.');
            return;
        }
        pending.current = true;
        const active = ++revision.current;
        setBusy(true);
        setError('');
        setFeedback('');
        try {
            const result = await writeQuestionnaire(missionId,view.template.id,view.template.version,view.data?.version ?? 0,
                Object.values(answers).filter(answer=>answer.response),fields,submit);
            if (active !== revision.current) return;
            // La réponse de sauvegarde suffit à confirmer l’enregistrement.
            apply({...view,data:result.data,editable:!submit});
            setFeedback(submit ? 'Fiche soumise à la revue.' : 'Brouillon enregistré.');
        } catch (cause) {
            if (active === revision.current) setError(cause instanceof Error ? cause.message : 'Enregistrement indisponible.');
        } finally {
            if (active === revision.current) {
                pending.current = false;
                setBusy(false);
            }
        }
    }

    function updateAnswer(id:string,change:Partial<Answer>) {
        setAnswers(items=>({...items,[id]:{...(items[id] ?? {questionId:id,response:''}),...change}}));
    }

    function updateSample(key:number,change:Partial<Sample>) {
        setSamples(items=>items.map(item=>item.key===key ? {...item,...change} : item));
    }

    return <>
        <PrimaryAction label={expanded ? 'Masquer la fiche de contrôle' : 'Fiche de contrôle · simulation'}
            onPress={()=>setExpanded(value=>!value)} />
        {expanded ? <View style={{gap:10}}>
            {view.editable && !view.data && view.library.length > 1 ? <FilterChips
                items={view.library.map(item=>({value:item.id,label:item.title}))} value={view.template.id}
                onChange={id=>{
                    const template = view.library.find(item=>item.id===id);
                    if (!busy && template && template.id!==view.template.id) {
                        setAnswers({});
                        setSamples([]);
                        setError('');
                        setView({...view,template});
                    }
                }} /> : null}
            <Text accessibilityRole="header" style={styles.section}>{view.template.title}</Text>
            {view.data ? <Text style={styles.body}>{statuses[view.data.status] ?? view.data.status} · Version {view.data.version}</Text> : null}
            {view.data?.review?.reason ? <Text style={styles.body}>Motif de revue · {view.data.review.reason}</Text> : null}
            {error ? <Text accessibilityRole="alert" style={styles.danger}>{error}</Text> : null}
            {feedback ? <Text accessibilityLiveRegion="polite" style={styles.body}>{feedback}</Text> : null}
            {view.template.questions.map(question=><View key={question.id} style={{gap:6}}>
                <Text style={styles.section}>{question.label}{question.required ? ' · Obligatoire' : ''}</Text>
                {view.editable ? <>
                    <FilterChips items={choices} value={answers[question.id]?.response ?? ''}
                        onChange={response=>{ if (!busy) updateAnswer(question.id,{response}); }} />
                    <TextInput multiline editable={!busy} accessibilityLabel={'Commentaire · '+question.label}
                        placeholder="Commentaire" style={styles.formField} maxLength={1000}
                        value={answers[question.id]?.comment ?? ''} onChangeText={comment=>updateAnswer(question.id,{comment})} />
                </> : <Text style={styles.body}>{[choices.find(item=>item.value===answers[question.id]?.response)?.label ?? 'Sans réponse',answers[question.id]?.comment].filter(Boolean).join(' · ')}</Text>}
            </View>)}
            <Text style={styles.section}>Vérifications sur échantillon</Text>
            {samples.map((sample,index)=><View key={sample.key} style={{gap:6}}>
                <Text style={styles.section}>Vérification {index+1}</Text>
                {view.editable ? <>
                    <TextInput editable={!busy} accessibilityLabel="Référence du test" placeholder="Référence du test" style={styles.formField}
                        maxLength={120} value={sample.reference} onChangeText={reference=>updateSample(sample.key,{reference})} />
                    <FilterChips items={outcomes} value={sample.outcome} onChange={outcome=>{ if (!busy) updateSample(sample.key,{outcome}); }} />
                    <TextInput editable={!busy} accessibilityLabel="Référence de preuve" placeholder="Référence de preuve" style={styles.formField}
                        maxLength={160} value={sample.evidenceReference ?? ''} onChangeText={evidenceReference=>updateSample(sample.key,{evidenceReference})} />
                    <TextInput multiline editable={!busy} accessibilityLabel="Commentaire du test" placeholder="Commentaire" style={styles.formField}
                        maxLength={1000} value={sample.comment ?? ''} onChangeText={comment=>updateSample(sample.key,{comment})} />
                    <PrimaryAction label="Retirer la vérification" disabled={busy} onPress={()=>setSamples(rows=>rows.filter(row=>row.key!==sample.key))} />
                </> : <Text style={styles.body}>{[sample.reference,outcomes.find(item=>item.value===sample.outcome)?.label,
                    sample.evidenceReference,sample.comment].filter(Boolean).join(' · ')}</Text>}
            </View>)}
            {view.editable ? <>
                <PrimaryAction label="Ajouter une vérification" disabled={busy || samples.length>=100}
                    onPress={()=>setSamples(items=>[...items,{key:nextKey.current++,reference:'',outcome:'NON_VERIFIE'}])} />
                <PrimaryAction label="Enregistrer le brouillon" disabled={busy} onPress={()=>void save(false)} />
                <PrimaryAction label="Soumettre à la revue" disabled={busy} onPress={()=>void save(true)} />
            </> : null}
            <PrimaryAction label={view.editable ? 'Abandonner la saisie et recharger' : 'Actualiser la fiche'}
                disabled={busy} onPress={()=>void reload()} />
        </View> : null}
    </>;
}
