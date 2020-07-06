package jp.co.internous.ecsite.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;

import jp.co.internous.ecsite.model.dao.GoodsRepository;
import jp.co.internous.ecsite.model.dao.UserRepository;
import jp.co.internous.ecsite.model.entity.Goods;
import jp.co.internous.ecsite.model.entity.User;
import jp.co.internous.ecsite.model.form.GoodsForm;
import jp.co.internous.ecsite.model.form.LoginForm;

@Controller
@RequestMapping("/ecsite/admin")
public class AdminController {
	
	//Repositoryを読み込む
	@Autowired
	private UserRepository userRepos;
	
	@Autowired
	private GoodsRepository goodsRepos;
	
	@RequestMapping("/")
	public String index() {
		return "adminindex";
	}
	
	@PostMapping("/welcome")
	public String welcome(LoginForm form, Model m) {
		//System.out.println(form.getUserName() + " " + form.getPassword());
		//ユーザー名とパスワードでユーザを検索
		List<User> users = userRepos.findByUserNameAndPassword(form.getUserName(), form.getPassword());
		//検索結果が存在していれば、isAdminを取得し、管理者だった場合のみ処理
		//if(strList.size() == 0)でリストが空かチェックできる
		if(users != null && users.size() > 0) {
			boolean isAdmin = users.get(0).getIsAdmin() != 0;
			if(isAdmin) {
				//GoodsRepositoryのインスタンスからfindAllメソッドを呼び出し、Goodsエンティティのリストを取得
				List<Goods> goods = goodsRepos.findAll();
				//addAttributeメソッドでView側に渡すオブジェクトデータを
				//第一引数にテンプレートから参照する変数名、
				//第二引数にオブジェクト名として格納
				m.addAttribute("userName", users.get(0).getUserName());
				m.addAttribute("password", users.get(0).getPassword());
				m.addAttribute("goods", goods);
			}
		}
		//returnで遷移先のテンプレート名を文字列で指定
		return "welcome";
	}
	
	@RequestMapping("/goodsMst")
	public String goodsMst(LoginForm form, Model m) {
		m.addAttribute("userName", form.getUserName());
		m.addAttribute("password", form.getPassword());
		
		return "goodsmst";
	}
	
	@RequestMapping("/addGoods")
	public String addGoods(GoodsForm goodsForm, LoginForm loginform, Model m) {
		m.addAttribute("username", loginform.getUserName());
		m.addAttribute("password", loginform.getPassword());
		
		Goods goods = new Goods();
		goods.setGoodsName(goodsForm.getGoodsName());
		goods.setPrice(goodsForm.getPrice());
		goodsRepos.saveAndFlush(goods);
		
		return "forward:/ecsite/admin/welcome";
	}
	
	@ResponseBody
	@PostMapping("/api/deleteGoods")
	public String deleteApi(@RequestBody GoodsForm f, Model m) {
		try {
			goodsRepos.deleteById(f.getId());
		} catch (IllegalArgumentException e) {
			return "-1";
		}
		return "1";
	}

}
