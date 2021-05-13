//金额转中文字符串
exports.toUpperMoney = function(lowerMoney) {

	// Constants:
	var MAXIMUM_NUMBER = 99999999999.99;
	// Predefine the radix characters and currency symbols for output:
	var CN_ZERO = "零";
	var CN_ONE = "壹";
	var CN_TWO = "贰";
	var CN_THREE = "叁";
	var CN_FOUR = "肆";
	var CN_FIVE = "伍";
	var CN_SIX = "陆";
	var CN_SEVEN = "柒";
	var CN_EIGHT = "捌";
	var CN_NINE = "玖";
	var CN_TEN = "拾";
	var CN_HUNDRED = "佰";
	var CN_THOUSAND = "仟";
	var CN_TEN_THOUSAND = "万";
	var CN_HUNDRED_MILLION = "亿";
	var CN_SYMBOL = "";
	var CN_DOLLAR = "元";
	var CN_TEN_CENT = "角";
	var CN_CENT = "分";
	var CN_INTEGER = "整";

	// Variables:
	var integral; // Represent integral part of digit number.
	var decimal; // Represent decimal part of digit number.
	var outputCharacters; // The output result.
	var parts;
	var digits, radices, bigRadices, decimals;
	var zeroCount;
	var i, p, d, ds;
	var quotient, modulus;

	// Validate input string:
	lowerMoney = lowerMoney.toString();
	if (lowerMoney == "") {
		console.log("不能为空 请输入数字金额!如：123.23");
		return "";
	}
	if (lowerMoney.match(/[^,.\d]/) != null) {
		console.log("输入字符串中的字符无效!");
		return "";
	}
	if ((lowerMoney).match(/^((\d{1,3}(,\d{3})*(.((\d{3},)*\d{1,3}))?)|(\d+(.\d+)?))$/) == null) {
		console.log("请输入正确的数字金额!");
		return "";
	}

	// Normalize the format of input digits:
	lowerMoney = lowerMoney.replace(/,/g, ""); // Remove comma delimiters.
	lowerMoney = lowerMoney.replace(/^0+/, ""); // Trim zeros at the beginning.
	// Assert the number is not greater than the maximum number.
	if (Number(lowerMoney) > MAXIMUM_NUMBER) {
		console.log("Too large a number to convert!");
		return "";
	}

	// Process the coversion from currency digits to characters:
	// Separate integral and decimal parts before processing coversion:
	parts = lowerMoney.split(".");
	if (parts.length > 1) {
		integral = parts[0];
		decimal = parts[1];
		// Cut down redundant decimal digits that are after the second.
		decimal = decimal.substr(0, 2);
	} else {
		integral = parts[0];
		decimal = "";
	}

	// Prepare the characters corresponding to the digits:
	digits = [CN_ZERO, CN_ONE, CN_TWO, CN_THREE, CN_FOUR, CN_FIVE, CN_SIX, CN_SEVEN, CN_EIGHT, CN_NINE];
	radices = ["", CN_TEN, CN_HUNDRED, CN_THOUSAND];
	bigRadices = ["", CN_TEN_THOUSAND, CN_HUNDRED_MILLION];
	decimals = [CN_TEN_CENT, CN_CENT];

	// Start processing:
	outputCharacters = "";
	// Process integral part if it is larger than 0:
	if (Number(integral) > 0) {
		zeroCount = 0;
		for (i = 0; i < integral.length; i++) {
			p = integral.length - i - 1;
			d = integral.substr(i, 1);
			quotient = p / 4;
			modulus = p % 4;
			if (d == "0") {
				zeroCount++;
			} else {
				if (zeroCount > 0) {
					outputCharacters += digits[0];
				}
				zeroCount = 0;
				outputCharacters += digits[Number(d)] + radices[modulus];
			}
			if (modulus == 0 && zeroCount < 4) {
				outputCharacters += bigRadices[quotient];
			}
		}
		outputCharacters += CN_DOLLAR;
	}

	// Process decimal part if there is:
	if (decimal != "") {
		for (i = 0; i < decimal.length; i++) {
			d = decimal.substr(i, 1);
			ds = decimal.substr(-1, 1);
			if (d == 0) {
				if (ds == 0) {
					outputCharacters += "";
				} else {
					outputCharacters += digits[Number(d)];
				}
			} else {

				outputCharacters += digits[Number(d)] + decimals[i];

			}
		}
	}

	// Confirm and return the final output string:
	if (outputCharacters == "") {
		outputCharacters = CN_ZERO + CN_DOLLAR;
	}

	if (decimal == "") {
		outputCharacters += CN_INTEGER;
	}

	outputCharacters = CN_SYMBOL + outputCharacters;

	return outputCharacters;
};

//金额字符串处理，形如123456.7890转化为123,456.79
exports.toMoney = function(num) {
  num = num.toFixed(2);
  var _regx = new RegExp('[-]?[0-9]+(\\.[0-9]+)?').exec(num);
  if (!_regx)
    return '0.00';
  var _temp = _regx[0].split('.');
  _temp[0] = _temp[0].replace(new RegExp('\\B(?=(\\d{3})+(?!\\d))', 'g'), ',');
  _temp[1] = _temp[1] || '00';
  _temp[1].length < 2 && (_temp[1] += '0');
  return _temp.join('.');
};

// 将字符串强制转换为金额，形如123,456.7890转化为123456.78
exports.forceToMoney = function(str) {
  var value = str;
  value = value.replace(new RegExp('[^\\d.]', 'g'), ""); // 清除“数字”和“.”以外的字符
  value = value.replace(new RegExp('\\.{2,}', 'g'), "."); // 只保留第一个. 清除多余的
  value = value.replace(".", "$#$").replace(new RegExp('\\.', 'g'), "").replace("$#$", ".");
  value = value.replace(new RegExp('^(\\-)*(\\d+)\\.(\\d\\d).*$'), '$1$2.$3'); // 只能输入两个小数
  if (value.indexOf(".") < 0 && value !== "") { // 以上已经过滤，此处控制的是如果没有小数点，首位不能为类似于 01、02的金额
    value = parseFloat(value);
  }
  return value;
};
