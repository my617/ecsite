let login = (event) => {
	//preventDefaultでブラウザが元々持っている処理を抑制
	event.preventDefault();

	//変数jsonStringを設定し、JSON形式のデータを用意
	let jsonString = {
			'userName': $('input[name=userName]').val(),
			'password': $('input[name=password]').val()
	};
	//IndexControllerに追加したloginメソッドにアクセス
	$.ajax({
		//POSTメソッド
		type: 'POST',
		///ecsite/api/loginにアクセス
		url: '/ecsite/api/login',
		//サーバー通信する際に送信データは、JSON構造のデータに「シリアライズ化」という処理を施す必要がある
		//この処理を実行できるメソッドがJSON.stringifyメソッド
		//JSON.stringify()の引数にシリアライズ化対象データを格納した変数を指定
		data: JSON.stringify(jsonString),
	 //リクエスト時に利用するContent-Typeヘッダー
		contentType: 'application/json',
		//応答データの種類をjsonに指定
		datatype: 'json',
		//スクリプトを読み込む際に利用する文字コード
		scriptCharset: 'utf-8'
	})
	//thenメソッドのコールバック関数により参照した結果を画面に出力
	//then(成功時の処理, 失敗時の処理)
	//成功時のコールバック
	.then((result) => {
		//JSON.parse() メソッドは文字列を JSON として解析し、文字列によって記述されている JavaScript の値やオブジェクトを構築
		let user = JSON.parse(result);
		$('#welcome').text(` -- ようこそ！ ${user.fullName}さん`);
		$('#hiddenUserId').val(user.id);
		$('input[name=userName]').val('');
		$('input[name=password]').val('');
	//通信失敗時のコールバック
	}, () => {
		console.error('Error: ajax connection failed.');
	}
	);
};
let addCart = (event) => {
	//event.target：イベント発生源である要素を取得
	//parent：親要素を取得
	//下の例でいうとevent.targetはイベントを起こしている<button class="cartBtn">カートに入れる</button>
	//イベント対象のボタンの親はtd、そのtd の親は<tr th:each="item: ${goods}">という意味
	//取得されたtr から、find('td') しているので、tr 内の td （複数ある場合はすべて）が検索され、取得される
	let tdList = $(event.target).parent().parent().find('td');
	
	//変数設定
	let id = $(tdList[0]).text();
	let goodsName = $(tdList[1]).text();
	let price = $(tdList[2]).text();
	let count = $(tdList[3]).find('input').val();
	
	if(count === '0' || count === '') {
		alert('注文数が0または空欄です。');
		return;
	}
	
	let cart = {
		'id' : id,
		'goodsName' : goodsName,
		'price' : price,
		'count' : count
	};
	//pushとは、配列オブジェクトの組み込みメソッドとして用意されており、
	//配列データの末尾に任意の要素を追加されるために利用される
	//今回は変数cartに格納した配列データをcartListに追加する
	cartList.push(cart);
	
	let tbody = $('#cart').find('tbody');
	$(tbody).children().remove();
	//forEach：配列の繰り返し処理にだけ使えるコード
	//基本形はarray.forEach(callback(value,index,array))で3つの引数を取ることができる
	//value:現在処理されている配列要素
	//index:現在処理されている配列要素のindex
	//下の場合はforEach(function(value, index))
	cartList.forEach(function(cart, index) {
		let tr = $('<tr />');
		
		//appendTo：要素の中身を他の要素に追加する
		//$(A).append(B) とした場合にAにBが追加される
		//$(A).appendTo(B) ではBにAが追加される
		$('<td />', {'text': cart.id}).appendTo(tr);
		$('<td />', {'text': cart.goodsName}).appendTo(tr);
		$('<td />', {'text': cart.price}).appendTo(tr);
		$('<td />', {'text': cart.count}).appendTo(tr);
		let tdButton = $('<td />');
		$('<button />', {
			'text': 'カート削除',
			'class': 'removeBtn',
		}).appendTo(tdButton);
		
		$(tdButton).appendTo(tr);
		$(tr).appendTo(tbody);
	});
	$('.removeBtn').on('click', removeCart);
}

let buy = (event) => {
	$.ajax({
		type: 'POST',
		url: '/ecsite/api/purchase',
		//dataの値をJSON文字列に変換
		data: JSON.stringify({
			"userId": $('#hiddenUserId').val(),
			"cartList": cartList
		}),
		//contentType：サーバにデータを送信する際に用いるcontent-typeヘッダの値
		contentType: 'application/json',
		datatype: 'json',
		scriptCharset: 'utf-8'
	})
	.then((result) => {
		alert('購入しました');
	}, () => {
		console.error('Error: ajax connection failed.');
	} 
	);
};

let removeCart = () =>{
	const tdList = $(event.target).parent().parent().find('td');
	let id = $(tdList[0]).text();
	cartList = cartList.filter(function(cart) {
		return cart.id !== id;
	});
	$(event.target).parent().parent().remove();
};

let showHistory = () => {
	$.ajax({
		type: 'POST',
		url: '/ecsite/api/history',
		data: JSON.stringify({"userId": $('#hiddenUserId').val() }),
		contentType: 'application/json',
		datatype: 'json',
		scriptCharset: 'utf-8',
	})
	.then((result) => {
		let historyList = JSON.parse(result);
		let tbody = $('#historyTable').find('tbody');
		$(tbody).children().remove();
		historyList.forEach((history, index) => {
			let tr = $('<tr />');
			
			$('<td />', {'text': history.goodsName}).appendTo(tr);
			$('<td />', {'text': history.itemCount}).appendTo(tr);
			$('<td />', {'text': history.createdAt}).appendTo(tr);
			
			$(tr).appendTo(tbody);
		});
		$('#history').dialog("open");
	}, () => {
		console.error('Error: ajax connection failed.');
	}
	);
}