<template>
<div class="rounded card p-4 el-table-transparent el-dark-input">
  <el-row type="flex" :gutter="20" class="pt-3 pb-4 px-3">
    <el-col :span="12">
      <TableTitle>告警策略列表</TableTitle>
    </el-col>
    <el-col :span="12" class="px-2 text-right">
      <el-button size="medium" type="indigo" @click="handleCreate()">新增告警策略</el-button>
      <el-button size="medium" type="indigo" @click="goBack()">返回</el-button>
    </el-col>
  </el-row>

  <!-- 表 start -->
  <el-table :data="tableData" v-loading="loading">
    <el-table-column label="序号" type="index" width="100"></el-table-column>
    <el-table-column label="规则名称" prop="name"></el-table-column>
    <el-table-column label="规则说明" prop="describe"></el-table-column>
    <el-table-column label="策略操作" align="center" width="150">
      <template v-slot="scope">
        <div class="text-right">
          <el-button type="indigo" size="mini" @click="handleEdit(scope.row)" class="mr-3">编辑</el-button>

          <el-popconfirm title="确定删除此项？" @confirm="handleDelete(scope.row)">
            <el-button slot="reference" type="danger" size="mini">删除</el-button>
          </el-popconfirm>
        </div>
      </template>
    </el-table-column>
  </el-table>
  <!-- 表 end -->

  <AlarmEditForm
      :alarm-dialog-visible.sync="showEditDialog"
      :business_id="business_id"
      :current_item="current_item"
      :key="current_item.id"
      :add_alarm="add_alarm"
      :update_alarm="update_alarm"
  ></AlarmEditForm>
</div>
</template>

<script>
import {defineComponent, ref} from "@vue/composition-api";
import TableTitle from "@/components/common/TableTitle.vue";
import useRoute from "@/utils/useRoute";
import useAlarmStrategyIndex from "@/view/pages/automation/useAlarmStrategyIndex";
import AlarmEditForm from "@/view/pages/automation/AlarmEditForm";
import useTableDataCUD from "@/view/pages/automation/useTableDataCUD";
import {warning_delete} from "@/api/automation";

export default defineComponent({
  name: "AlarmStrategy",
  components: {
    TableTitle,
    AlarmEditForm,
  },
  setup(){
    let {route, router} = useRoute()
    let business_id = route.query.id
    let current_item = ref({})

    let {
      tableData,
      loading,
      getAlarmStrategyIndex,
    } = useAlarmStrategyIndex(business_id)

    // 后退
    function goBack(){
      router.go(-1)
    }

    // 编辑弹窗
    let showEditDialog = ref(false)

    function handleCreate() {
      handleEdit({})
    }

    // 编辑
    function handleEdit(item){
      showEditDialog.value = true
      current_item.value = item
    }

    // 删除
    function handleDelete(item){
      warning_delete({id: item.id}).then(({data})=>{
        if(data.code === 200){
          remove_alarm(item)
        }
      })
    }

    // tableData 的增删改逻辑
    let {
      add_alarm,
      remove_alarm,
      update_alarm,
    } = useTableDataCUD(tableData, getAlarmStrategyIndex)

    return {
      tableData,
      loading,
      goBack,
      showEditDialog,
      business_id,
      current_item,
      handleCreate,
      handleEdit,
      handleDelete,
      add_alarm,
      update_alarm,
    }
  }
})
</script>

<style scoped>

</style>