import {ref, watch} from "@vue/composition-api";
import {automation_show, automation_symbol} from "@/api/automation";

export default function useAlarmTriggerOptions(formData){
    let triggerOptions = ref([])

    watch(()=>formData.bid, (val)=>{
        if(val){
            automation_show({bid: val}).then(({data})=>{
                if(data.code === 200 && data.data){
                    triggerOptions.value = data.data
                }
            })
        }
    }, {
        immediate: true
    })

    let symbolOptions = ref([])

    automation_symbol().then(({data})=>{
        if(data.code === 200 && data.data){
            symbolOptions.value = data.data
        }
    })

    let operatorOptions = ref([
        {label: "或", value: "||"},
        {label: "且", value: "&&"},
    ])

    // 控制策略按类型选择输入框
    let typeOptions = ref([
        {label: "设备条件类型", value: 1},
        {label: "时间条件类型", value: 2},
    ])

    return {
        triggerOptions,
        symbolOptions,
        operatorOptions,
        typeOptions,
    }
}