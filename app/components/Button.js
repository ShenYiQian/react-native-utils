import React,{Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity
} from 'react-native';

export default class Button extends Component{
    constructor(props){
        super(props);
    }
    render(){
        /*配置
            text - 文本信息
            click - 处理事件
            backgroundColor - 背景
            color - 文本颜色
            width - 宽度
            height - 高度*/
        const {text}=this.props;
        const {click}=this.props;
        const {backgroundColor}=this.props;
        const {color}=this.props;
        const {fontWeight}=this.props;
        const width=Number(this.props.width);
        const height = Number(this.props.height);
        const fontSize=Number(this.props.fontSize);
        return (
            <TouchableOpacity style={[
                                styles.button,
                                backgroundColor ? {backgroundColor} : {},
                                width ? {width} : {},
                                height ? {height} : {}
                                ]}
                              onPress={click}
                              activeOpacity={0.8}
                              disabled={this.props.disabled}
                                >
                <Text style={[styles.buttonText,
                                color ? {color} : {},
                                fontWeight ? {fontWeight} : {},
                                fontSize ? {fontSize} : {}
                            ]}>{text}</Text>
            </TouchableOpacity>
        )
    }
}

const styles=StyleSheet.create({
    button:{
        width:100,
        height:40,
        borderRadius:5,
        justifyContent:'center',
        alignItems:'center'
    },
    buttonText:{
        fontSize:18,
        backgroundColor:'transparent'
    }
})