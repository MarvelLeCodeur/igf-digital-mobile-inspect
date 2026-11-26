import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useWorkspace } from '../../../dry-module/dry-auth/context/AuthContext';
import { getProgram, saveProgram } from '../service/checklist.service';
import type { AuditProgram } from '../service/checklist.service';

const lines = (value:string) => value.split('\n').map(line => line.trim()).filter(Boolean);

export function useChecklistScreen() {
    const {session,selected} = useWorkspace();
    const id = session ? selected?._id : undefined;
    const mayRead = !!id && selected?.workPermissions?.readProgram !== false;
    const mayWrite = mayRead && selected?.workPermissions?.writeProgram === true;
    const [tab,setTab] = useState('procedures');
    const [loaded,setLoaded] = useState<{id:string;data:AuditProgram|null;error:string}|null>(null);
    const [refresh,setRefresh] = useState(0);
    const [objectives,setObjectives] = useState('');
    const [procedures,setProcedures] = useState('');
    const [editing,setEditing] = useState(false);
    const [saving,setSaving] = useState(false);
    const [saveError,setSaveError] = useState('');
    const [feedback,setFeedback] = useState('');
    const saveContext = useRef(0);

    useLayoutEffect(() => {
        // Réinitialiser le formulaire quand l’inspecteur change de mission ou de session.
        setTab('procedures');
        setEditing(false);
        setSaving(false);
        setSaveError('');
        setFeedback('');
        return () => { saveContext.current++; };
    },[id,mayWrite]);

    useEffect(() => {
        if (!id || !mayRead) return;
        let current = true;
        setLoaded(null);
        void getProgram(id).then(result => {
            if (current) setLoaded({id,data:result.data,error:''});
        }).catch(cause => {
            if (current) setLoaded({id,data:null,error:cause instanceof Error ? cause.message : 'Programme indisponible.'});
        });
        return () => { current=false; };
    },[id,mayRead,refresh]);

    const current = mayRead && loaded?.id === id ? loaded : null;
    const data = current?.data ?? null;
    const loading = mayRead && !current;
    const objectiveLines = lines(objectives);
    const procedureLines = lines(procedures);
    const canSave = mayWrite && !saving && !loading && objectiveLines.length >= 1 && objectiveLines.length <= 20
        && objectiveLines.every(line => line.length <= 500) && procedureLines.length >= 1 && procedureLines.length <= 30
        && procedureLines.every(line => line.length <= 1000);

    function startEditing() {
        if (!mayWrite || !current || current.error) return;
        setObjectives(data?.objectives.join('\n') ?? '');
        setProcedures(data?.procedures.join('\n') ?? '');
        setFeedback('');
        setSaveError('');
        setEditing(true);
    }

    async function save() {
        if (!id || !editing || !canSave) return;
        const version = ++saveContext.current;
        setSaving(true);
        setSaveError('');
        try {
            const response = await saveProgram(id,{objectives:objectiveLines,procedures:procedureLines},data?.version ?? 0);
            if (saveContext.current !== version) return;
            setLoaded({id,data:response.data,error:''});
            setEditing(false);
            setFeedback('Programme enregistré.');
        } catch (error) {
            if (saveContext.current === version) {
                setSaveError(error instanceof Error ? error.message : 'Impossible d’enregistrer le programme.');
            }
        } finally {
            if (saveContext.current === version) setSaving(false);
        }
    }

    function reload() {
        // La version rechargée doit être relue avant de modifier à nouveau le programme.
        setEditing(false);
        setSaveError('');
        setFeedback('');
        setLoaded(null);
        setRefresh(value=>value+1);
    }

    return {session,selected,tab,setTab,data,error:current?.error ?? '',loading,mayRead,mayWrite,objectives,setObjectives,
        procedures,setProcedures,editing,setEditing,saving,saveError,feedback,canSave,startEditing,save,reload};
}
