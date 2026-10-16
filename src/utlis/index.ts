import md5 from "md5";
import {message} from "ant-design-vue";

// 密码加密规则
export const passwordRules = (val: string) => {
  const reversedStr = val.toString().split("").reverse().join("");
  return md5(`GATMoneyPwd@${reversedStr}${val}`);
};

// 密码正则：至少8位，必须包含字母和数字与大写
export const passwordReg = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

