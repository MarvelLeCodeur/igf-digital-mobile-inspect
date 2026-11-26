import { useMemo, useState } from 'react';

export function useAgendaScreen() {
    const [selected,setSelected] = useState(() => new Date());
    const days = useMemo(() => {
        const first = new Date(selected);
        first.setDate(first.getDate() - (first.getDay()+6)%7);
        return Array.from({length:7},(_,index) => {
            const day = new Date(first);
            day.setDate(first.getDate()+index);
            return day;
        });
    },[selected]);
    function moveWeek(delta:number) {
        setSelected(previous => {
            const day = new Date(previous);
            day.setDate(day.getDate()+7*delta);
            return day;
        });
    }
    return {selected,setSelected,days,moveWeek};
}
