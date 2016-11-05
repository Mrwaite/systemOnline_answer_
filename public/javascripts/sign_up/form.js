var matchRegExp = {
    name : '^[\\u4e00-\\u9fa5]{0,}$',
    stNumber : '^\\d{8}$',
    telNumber : '^(13[0-9]|14[5|7]|15[0|1|2|3|5|6|7|8|9]|17[0-9]|18[0|1|2|3|5|6|7|8|9])\\d{8}$'
};

var noMatchMsg = {
    name: '请输入中文',
    stNumber: '请输入8位学号',
    telNumber: '请输入规范手机号码'
};

var input_tag = {
    name : false,
    stNumber : false,
    telNumber : false
}

function check(domID, post, bool) {
    $('#'+ domID).on('blur', function (e) {
        var VdomID = $('#' + domID).val();
        var JdomID = {};
        JdomID[domID] = VdomID;
        $('#submit_lable').addClass('v-hidden');
        if(VdomID) {
            if(new RegExp(matchRegExp[domID]).test(VdomID)) {
                if(bool) {
                    $.post('/checkNameOrSN', JdomID, function (data) {
                        post(data);
                    });
                } else {
                    $('#' + domID).parent().removeClass('error');
                    $('#' + domID +'_lable').addClass('v-hidden');
                    input_tag[domID] = true;
                    if(input_tag.name & input_tag.stNumber & input_tag.telNumber) $('#submit').removeClass('disabled');
                }
            } else {
                input_tag[domID] = false;
                $('#' + domID).parent().addClass('error');
                $('#' + domID +'_lable').text(noMatchMsg[domID]).removeClass('v-hidden');
                if(!(input_tag.name & input_tag.stNumber & input_tag.telNumber)) $('#submit').addClass('disabled');
            }
        } else {
            $('#' + domID).parent().addClass('error');
            $('#' + domID +'_lable').addClass('v-hidden');
        }
    });
}

$(document).ready(function () {
    if(screen.width < 426 ) {
        $('#name_lable').removeClass('left');
        $('#stNumber_lable').removeClass('left');
        $('#telNumber_lable').removeClass('left');
        $('.fields').each(function(index, field){field.style.marginBottom='0px'})
    }
    check('name', function (data) {
        if (data.code === 1) {
            //表示存在这个name
            input_tag.name = false;
            $('#name').parent().addClass('error');
            $('#name_lable').text('此姓名已被使用').removeClass('v-hidden');
            if(!(input_tag.name & input_tag.stNumber & input_tag.telNumber)) $('#submit').addClass('disabled');
        } else {
            input_tag.name = true;
            $('#name').parent().removeClass('error');
            $('#name_lable').addClass('v-hidden');
            if(input_tag.name & input_tag.stNumber & input_tag.telNumber) $('#submit').removeClass('disabled');
        }
    }, false);
    check('stNumber', function (data) {
        if (data.code === 1) {
            //表示存在这个name
            input_tag.stNumber = false;
            $('#stNumber').parent().addClass('error');
            $('#stNumber_lable').text('此学号已经被使用').removeClass('v-hidden');
            if(!(input_tag.name & input_tag.stNumber & input_tag.telNumber)) $('#submit').addClass('disabled');
        } else {
            input_tag.stNumber = true;
            $('#stNumber').parent().removeClass('error');
            $('#stNumber_lable').addClass('v-hidden');
            if(input_tag.name & input_tag.stNumber & input_tag.telNumber) $('#submit').removeClass('disabled');
        }
    }, true);
    check('telNumber', function () {}, false);
    $('#submit').on('click', function (e) {
        if( $('#name').val() !== '' && $('#stNumber').val() !== '' &&  $('#telNumber').val() !== '' &&  $('#major').val() !== '') {
            $('#submit_lable').addClass('v-hidden');
            var data = {
                name :  $('#name').val(),
                stNumber : $('#stNumber').val(),
                telNumber : $('#telNumber').val(),
                direction : parseInt($('#dir').val()),
                sex : parseInt($('#sex').val()),
                major : $('#major').val(),
                grade : parseInt($('#grade').val())
            };
            $.ajax({
                type : 'post',
                url : '/form',
                data : data,
                success : function (data) {
                    var code = data.code;
                    var msg = data.msg;
                    $('#submitForm input').attr("disabled",true);
                    $('#submitForm select').attr("disabled",true);
                    $('#submit').addClass('disabled');
                    if(code === 1) {
                        $('#show_msg').html( msg +',请刷新重新提交,如若还是有问题请立即与管理员联系.');
                    } else if(code === 2) {
                        if(msg.sex === '男'){
                            $('#show_img').html($('<img src="/images/man.png">'));
                        } else {
                            $('#show_img').html($('<img src="/images/female.png">'));
                        }
                        $('#show_name').text(msg.name);
                        $('#show_sex').text(msg.sex);
                        var showMsg = '学号 : ' + msg.stNumber +'  <br>'+
                        '联系方式 : '+ msg.telNumber +' <br>' +
                        '预期方向 : ' + msg.direction + ' <br>'+
                        '专业班级 : ' + msg.major + '<br>'+
                        '年级 : '+ msg.grade +' <br>'
                            ;
                         if(msg.grade !== '大一') {
                             if(msg.direction === '前端组')
                                $('#paper').attr('href', '/topic/web_grade2.pdf');
                             if(msg.direction === '网络组')
                                $('#paper').attr('href', '/topic/net_grade2.pdf');
                         }
                        $('#show_msg').html(showMsg);
                    }
                    $('.ui.modal')
                        .modal('show')
                    ;
                    $('#submit').html('已提交');
                }

            });
        } else {
            $('#submit_lable').removeClass('v-hidden');
        }
    });
});
