<template>
    <tr v-if="item.isMixed" style="border: 1px double rgba(0,0,0,0.25);" >
        <td v-for="column in columns" :key="column.key" style="background-color: rgba(0,0,0,0.025); color: black;">
            <v-card v-if="!column.isExpandable"></v-card>
            <v-card variant="plain" v-else :style="`text-align:${column.align};`">
                <!--If column is plenums-->
                <span v-if="column.key === 'plenums'">
                    <span v-for="(plenum, index ) in getGroupedPlenums" :key="index">
                        {{ `${plenum.shortName + plenum.size}(${plenum.count})${index !== getGroupedPlenums.length
                            - 1 ? ',' : ''}` }}
                    </span>
                </span>
                <!--Else-->
                <span v-else>{{ item[column.key] }}</span>
            </v-card>
        </td>
    </tr>
</template>
<script>
export default {
    name: "RoomExpandedRow",
    props: {
        columns: Array,
        item: Object,
    },
    computed:{
        getGroupedPlenums(){
            const group = this.item.plenums.reduce((acc, plenum) => {
                const key = `${plenum.shortName}${plenum.size}`;
                if(acc[key])
                    acc[key].count += plenum.count
                else {
                    acc[key] = {
                        name: plenum.name,
                        shortName: plenum.shortName ? plenum.shortName : plenum.short_name,
                        size: plenum.size,
                        count: 1
                    };
                }
                return acc;
            }, {});
            return Object.values(group);
        }
    }
}
</script>