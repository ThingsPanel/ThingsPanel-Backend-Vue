<template>
<el-form
    label-position="left"
    label-width="100px"
    :model="formData"
>
  <el-form-item label="设备ID" prop="d_id">
    <el-input v-model="formData.d_id"></el-input>
  </el-form-item>
  <el-form-item label="自定义属性" prop="location">
    <el-input type="textarea" v-model="formData.location"></el-input>
  </el-form-item>

  <div class="pt-4">
    <el-button class="w-100" type="primary" @click="handleSave()">保存</el-button>
  </div>
</el-form>
</template>

<script>
import {defineComponent, reactive} from "@vue/composition-api";

export default defineComponent({
  name: "DeviceAttributeForm",
  props: {
    device_item: {
      required: true,
    }
  },
  setup(props, context){
    let formData = reactive({
      d_id: props.device_item.d_id,
      location: props.device_item.location,
    })

    function handleSave(){
      props.device_item.d_id = formData.d_id
      props.device_item.location = formData.location

      context.emit("change")
    }

    return {
      formData,
      handleSave,
    }
  }
})
</script>

<style scoped>

</style>