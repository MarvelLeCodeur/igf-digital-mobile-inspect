export const severities = [
    { value:'FAIBLE', label:'Faible' },
    { value:'MOYENNE', label:'Moyenne' },
    { value:'ELEVEE', label:'Élevée' },
    { value:'CRITIQUE', label:'Critique' },
] as const;
export type Severity = typeof severities[number]['value'];

export const missionStatusLabels: Record<string,string> = {
    BROUILLON:'Brouillon', SOUMISE:'Soumise', AUTORISEE:'Autorisée', PLANIFIEE:'Planifiée',
    EN_COURS:'En cours', EN_REVUE:'En revue', TERMINEE:'Clôturée', ARCHIVEE:'Archivée',
};
