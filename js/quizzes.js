/*
 * ============================================================
 *  题库集合  —  多测评的核心数据
 * ============================================================
 *  说明：
 *   - 每一套就是一个独立测评（题库）。后台可列表、切换启用、导入新库、删除。
 *   - 每套字段：
 *       id          唯一标识（切换/存储用，别重复）
 *       title       测评标题
 *       intro       开场白
 *       resultMode  "level" 按总分分级 | "type" 取最高维度（导入时系统也会自动识别）
 *       questions   题目数组，每题 options 用 score(数字) 或 scores:{维度:分值}
 *       levels      level 模式的 5 档结果（min 为包含下限，从低到高）
 *       types       type 模式的维度类型（key 与选项 scores 的键一致）
 *   - 切换「当前测评」在后台操作；用户端永远只测当前启用的那一套。
 * ============================================================
 */
window.QUIZZES = [

  /* ============ 1. 班味浓度（level 示例） ============ */
  {
    id: "banwei",
    title: "你的班味浓度测试",
    intro: "打工人的专属体检：测测你被工作腌入味的程度。10 道题，1 分钟出结果。",
    resultMode: "level",
    questions: [
      { q: "周五下班前，老板发来一句「有个小想法」——", options: [
        { text: "已读不回，周一再说", score: 0 }, { text: "秒回「好的马上改」", score: 3 },
        { text: "表面好的，心里已死", score: 2 }, { text: "直接装没看见", score: 1 } ] },
      { q: "你的微信昵称 / 签名透露出——", options: [
        { text: "诗和远方", score: 0 }, { text: "积极进取向上", score: 2 },
        { text: "摸鱼第一", score: 1 }, { text: "「已读乱回，事多勿扰」", score: 3 } ] },
      { q: "开会时你通常——", options: [
        { text: "真的在听", score: 1 }, { text: "疯狂记笔记显得很忙", score: 3 },
        { text: "神游天外但疯狂点头", score: 2 }, { text: "偷偷回消息", score: 1 } ] },
      { q: "同事说「辛苦了」，你回——", options: [
        { text: "应该的，应该的", score: 3 }, { text: "不辛苦，命苦", score: 1 },
        { text: "互相伤害", score: 0 }, { text: "笑而不语", score: 2 } ] },
      { q: "你的周末状态是——", options: [
        { text: "充电旅行", score: 0 }, { text: "补觉为主", score: 2 },
        { text: "焦虑周一", score: 3 }, { text: "假装在上班", score: 1 } ] },
      { q: "看到「赋能 / 闭环 / 对齐」这类词，你——", options: [
        { text: "反感但已经习惯", score: 3 }, { text: "完全听不懂", score: 0 },
        { text: "随口就能用", score: 2 }, { text: "专门用来怼人", score: 1 } ] },
      { q: "你工位上的东西——", options: [
        { text: "绿植鲜花", score: 0 }, { text: "一堆文件和便利贴", score: 3 },
        { text: "仅一台电脑", score: 1 }, { text: "解压捏捏乐", score: 1 } ] },
      { q: "下班后收到工作消息，你——", options: [
        { text: "立刻处理", score: 3 }, { text: "假装没看到明天回", score: 1 },
        { text: "已设置免打扰", score: 0 }, { text: "焦虑但不回", score: 2 } ] },
      { q: "你如何形容自己的精神状态——", options: [
        { text: "元气满满", score: 0 }, { text: "稳定发疯", score: 2 },
        { text: "已麻木", score: 3 }, { text: "间歇性踌躇满志", score: 1 } ] },
      { q: "如果明天突然不用上班，你第一反应是——", options: [
        { text: "终于自由了", score: 0 }, { text: "那工资怎么办", score: 3 },
        { text: "睡到自然醒", score: 1 }, { text: "浑身不自在", score: 2 } ] }
    ],
    levels: [
      { min: 0,  label: "班味清新期 · 0%", analysis: "你几乎没被工作腌入味，下班就是下班，灵魂还属于自己。同事觉得你「不太上道」，但你活得最像个人。" },
      { min: 7,  label: "班味萌芽期 · 30%", analysis: "你开始学会说「收到」，但周末还能短暂做回自己。班味若隐若现，属于可抢救的潜力股。" },
      { min: 13, label: "班味发酵期 · 60%", analysis: "你已熟练使用「赋能」「对齐」，周一焦虑初现。班味正在发酵，建议定期去油（出门走走）。" },
      { min: 20, label: "班味醇厚期 · 85%", analysis: "你是办公室里的定海神针，老板画饼你第一个鼓掌。班味醇厚，同事离不开你，但你自己也快离不开班了。" },
      { min: 26, label: "班味溢出期 · 100%", analysis: "你已彻底腌入味，梦里都在回工作消息。建议立刻放下手机，去楼下走走——哪怕只是假装去打印。" }
    ]
  },

  /* ============ 2. 互联网人设崩塌指数（level） ============ */
  {
    id: "renmshe",
    title: "互联网人设崩塌指数",
    intro: "你在网上立的人设，离翻车还有多远？10 道题测出你的人设稳固度。",
    resultMode: "level",
    questions: [
      { q: "朋友圈发完 5 分钟，你最可能——", options: [
        { text: "坦然等赞", score: 0 }, { text: "反复看有没有人评", score: 2 },
        { text: "觉得哪句不对想删", score: 3 }, { text: "立刻设为仅三天", score: 1 } ] },
      { q: "别人眼中你的标签是——", options: [
        { text: "和本人一致", score: 0 }, { text: "差不多但美化了", score: 2 },
        { text: "完全两码事", score: 3 }, { text: "我也不知道", score: 1 } ] },
      { q: "晒精致生活时，实际状态是——", options: [
        { text: "确实精致", score: 0 }, { text: "摆拍半小时", score: 2 },
        { text: "滤镜拉满硬凑", score: 3 }, { text: "随手一发", score: 1 } ] },
      { q: "有人对你的「人设」提出质疑，你——", options: [
        { text: "无所谓", score: 0 }, { text: "笑着圆过去", score: 2 },
        { text: "连夜删帖", score: 3 }, { text: "假装没看见", score: 1 } ] },
      { q: "你的账号更新频率是——", options: [
        { text: "随缘真实", score: 0 }, { text: "每周精修几条", score: 2 },
        { text: "为了维持人设硬发", score: 3 }, { text: "偶尔冒泡", score: 1 } ] },
      { q: "「人设」和真实收入差距大吗——", options: [
        { text: "基本一致", score: 0 }, { text: "稍微包装", score: 2 },
        { text: "天差地别", score: 3 }, { text: "懒得包装", score: 1 } ] },
      { q: "遇到尴尬事，你会——", options: [
        { text: "大大方方说", score: 0 }, { text: "自嘲化解", score: 2 },
        { text: "坚决捂死", score: 3 }, { text: "转移话题", score: 1 } ] },
      { q: "你对「立人设」的态度是——", options: [
        { text: "做自己就好", score: 0 }, { text: "适当经营", score: 2 },
        { text: "必须立住否则慌", score: 3 }, { text: "看心情", score: 1 } ] },
      { q: "如果人设翻车，你第一反应是——", options: [
        { text: "承认并道歉", score: 0 }, { text: "解释为误会", score: 2 },
        { text: "注销跑路", score: 3 }, { text: "装没事", score: 1 } ] },
      { q: "你觉得自己需要维持人设吗——", options: [
        { text: "完全不需要", score: 0 }, { text: "看场合", score: 2 },
        { text: "非常需要", score: 3 }, { text: "偶尔需要", score: 1 } ] }
    ],
    levels: [
      { min: 0,  label: "人设磐石 · 0%", analysis: "你基本没立什么人设，网上网下都是同一个你。翻车？你根本没车可翻，松弛感拉满。" },
      { min: 7,  label: "人设稳固 · 30%", analysis: "你有点小心思但不浮夸，偶尔美化无伤大雅。人设稳如老狗，翻车概率极低。" },
      { min: 13, label: "人设摇晃 · 60%", analysis: "你在经营和真实之间反复横跳，稍微用力过猛就会被看穿。建议少滤镜、多真诚。" },
      { min: 20, label: "人设高危 · 85%", analysis: "你的人设全靠硬撑，稍有风吹草动就岌岌可危。网友已经在等你的下一处破绽了。" },
      { min: 26, label: "人设已塌 · 100%", analysis: "你的人设早被扒得底裤都不剩，翻车是常态。不如直接摆烂真实点，反而圈粉。" }
    ]
  },

  /* ============ 3. 你妈眼里的你是什么废物（level） ============ */
  {
    id: "mama",
    title: "你妈眼里的你是什么废物",
    intro: "妈眼中，你永远差那么点意思。测测你在家属于哪类「废物」光荣身份。",
    resultMode: "level",
    questions: [
      { q: "你妈催你「找个对象」，你通常——", options: [
        { text: "已脱单她满意", score: 0 }, { text: "假装听不见", score: 2 },
        { text: "吵架对抗", score: 3 }, { text: "敷衍说在看", score: 1 } ] },
      { q: "你妈评价你做饭水平——", options: [
        { text: "夸你贤惠", score: 0 }, { text: "勉强能吃", score: 2 },
        { text: "「这也能叫饭？」", score: 3 }, { text: "从不下厨", score: 1 } ] },
      { q: "你多久主动给家里打电话——", options: [
        { text: "几乎每天", score: 0 }, { text: "每周一次", score: 2 },
        { text: "妈打来才接", score: 3 }, { text: "看心情", score: 1 } ] },
      { q: "你妈觉得你工资——", options: [
        { text: "够花还存钱", score: 0 }, { text: "勉强够花", score: 2 },
        { text: "「怎么够花啊」", score: 3 }, { text: "别问", score: 1 } ] },
      { q: "你房间/出租屋的整洁度——", options: [
        { text: "一尘不染", score: 0 }, { text: "还算整齐", score: 2 },
        { text: "妈看了要骂", score: 3 }, { text: "能住就行", score: 1 } ] },
      { q: "过年亲戚问收入，你妈——", options: [
        { text: "替你挡回去", score: 0 }, { text: "含糊带过", score: 2 },
        { text: "抢着夸你", score: 1 }, { text: "当场拆你台", score: 3 } ] },
      { q: "你妈让你「多穿点」，你——", options: [
        { text: "乖乖穿上", score: 0 }, { text: "嘴上答应", score: 2 },
        { text: "「热死了不穿」", score: 3 }, { text: "看天气", score: 1 } ] },
      { q: "你帮家里干家务的频率——", options: [
        { text: "抢着干", score: 0 }, { text: "被叫才动", score: 2 },
        { text: "装没看见", score: 3 }, { text: "偶尔帮", score: 1 } ] },
      { q: "你妈对你的终极评价通常是——", options: [
        { text: "「还算省心」", score: 0 }, { text: "「你看看别人」", score: 2 },
        { text: "「白养你了」", score: 3 }, { text: "「随你吧」", score: 1 } ] },
      { q: "你觉得自己是妈眼里的——", options: [
        { text: "贴心小棉袄", score: 0 }, { text: "普通娃", score: 2 },
        { text: "全家拖油瓶", score: 3 }, { text: "时好时坏", score: 1 } ] }
    ],
    levels: [
      { min: 0,  label: "妈宝级优等生 · 0%", analysis: "你在妈眼里基本是别人家的孩子，偶尔被念叨但不算废物。这种荣耀，且行且珍惜。" },
      { min: 7,  label: "勉强合格 · 30%", analysis: "妈对你谈不上失望，也谈不上骄傲。属于「还行吧」档位，再努力一点就能翻身。" },
      { min: 13, label: "资深小废物 · 60%", analysis: "妈对你的嫌弃已具规模，「你看别人家」是口头禅。但废物也有废物的可爱，别太在意。" },
      { min: 20, label: "特级废物 · 85%", analysis: "在妈眼里你基本等于「白养」，催婚催生催上班三件套全中。躺平吧，反正也改不了她的嘴。" },
      { min: 26, label: "废物界天花板 · 100%", analysis: "你是妈朋友圈里反面教材的天花板。但换个角度，能被妈这样念也是一种被爱的方式（强行安慰）。" }
    ]
  },

  /* ============ 4. AI 会怎么"评价"你（level） ============ */
  {
    id: "ai",
    title: "AI 会怎么「评价」你",
    intro: "假如 AI 是个嘴毒的朋友，它会对你做出什么锐评？10 题看看你的「AI 印象分」。",
    resultMode: "level",
    questions: [
      { q: "你用 AI 最常做的事是——", options: [
        { text: "认真学东西", score: 0 }, { text: "写周报摸鱼", score: 2 },
        { text: "让它替我想文案", score: 3 }, { text: "偶尔问问", score: 1 } ] },
      { q: "面对新工具，你——", options: [
        { text: "第一时间上手", score: 0 }, { text: "观望一阵", score: 2 },
        { text: "「这有啥用」", score: 3 }, { text: "别人教才用", score: 1 } ] },
      { q: "你的信息来源主要是——", options: [
        { text: "多方求证", score: 0 }, { text: "热搜+群聊", score: 2 },
        { text: "「听朋友说」", score: 3 }, { text: "公众号", score: 1 } ] },
      { q: "AI 给你提建议，你——", options: [
        { text: "理性采纳", score: 0 }, { text: "挑爱听的", score: 2 },
        { text: "「AI 懂啥」", score: 3 }, { text: "试试看", score: 1 } ] },
      { q: "你囤了多少「从没打开过」的课程/资料——", options: [
        { text: "几乎没有", score: 0 }, { text: "一点点", score: 2 },
        { text: "硬盘都满了", score: 3 }, { text: "几份", score: 1 } ] },
      { q: "你对自己「自律」的评价是——", options: [
        { text: "还挺自律", score: 0 }, { text: "时好时坏", score: 2 },
        { text: "全靠 deadline", score: 3 }, { text: "随缘", score: 1 } ] },
      { q: "你解决问题的方式偏向——", options: [
        { text: "自己研究", score: 0 }, { text: "搜教程", score: 2 },
        { text: "直接问人/甩锅", score: 3 }, { text: "试错", score: 1 } ] },
      { q: "你对待「计划」的态度——", options: [
        { text: "列清单执行", score: 0 }, { text: "列了不怎么看", score: 2 },
        { text: "「计划赶不上变化」", score: 3 }, { text: "脑子里过一遍", score: 1 } ] },
      { q: "你觉得自己「拖延」吗——", options: [
        { text: "基本不拖", score: 0 }, { text: "小拖怡情", score: 2 },
        { text: "重度患者", score: 3 }, { text: "看事", score: 1 } ] },
      { q: "如果 AI 给你一句忠告，你希望是——", options: [
        { text: "如何更高效", score: 0 }, { text: "如何更开心", score: 2 },
        { text: "别再懒了", score: 3 }, { text: "别内耗", score: 1 } ] }
    ],
    levels: [
      { min: 0,  label: "AI 眼中的优等生 · 0%", analysis: "AI 会对你点头：这人逻辑清晰、肯学肯做。你是它乐意帮忙的那类用户，印象分拉满。" },
      { min: 7,  label: "潜力股 · 30%", analysis: "AI 觉得你不错但有点小懒，稍微推一把就能起飞。它给你的评价是「可塑之才」。" },
      { min: 13, label: "普通打工人 · 60%", analysis: "AI 对你的评价很中性：会摸鱼、会拖延，但也不算摆烂。它建议你把囤的资料真打开看看。" },
      { min: 20, label: "重点关照对象 · 85%", analysis: "AI 已经看穿你：计划永远停在列清单，资料永远在吃灰。它想锐评你但又舍不得太狠。" },
      { min: 26, label: "AI 的吐槽素材 · 100%", analysis: "AI 对你的评价四个字：又懒又萌。它建议先别问「怎么暴富」，先把手头事做完。" }
    ]
  },

  /* ============ 5. 你上辈子是怎么死的（level） ============ */
  {
    id: "pastlife",
    title: "你上辈子是怎么死的",
    intro: "前世的死法，藏着你今生的性格密码。10 题测出你的「前世结局」。",
    resultMode: "level",
    questions: [
      { q: "遇到危险，你的本能是——", options: [
        { text: "正面刚", score: 3 }, { text: "先跑为敬", score: 0 },
        { text: "喊人帮忙", score: 1 }, { text: "愣住", score: 2 } ] },
      { q: "你对「吃」的态度——", options: [
        { text: "啥都敢尝", score: 3 }, { text: "谨慎挑食", score: 0 },
        { text: "看心情", score: 1 }, { text: "怕不干净", score: 2 } ] },
      { q: "你更容易因为什么冲动——", options: [
        { text: "为朋友出头", score: 3 }, { text: "为爱头脑热", score: 2 },
        { text: "为钱冒险", score: 1 }, { text: "基本不冲动", score: 0 } ] },
      { q: "你的好奇心——", options: [
        { text: "爆棚停不下", score: 3 }, { text: "适度", score: 1 },
        { text: "「关我啥事」", score: 0 }, { text: "只对自己有关的好奇", score: 2 } ] },
      { q: "古代你最可能是——", options: [
        { text: "冲锋的将军", score: 3 }, { text: "账房先生", score: 1 },
        { text: "逍遥侠客", score: 2 }, { text: "深宫贵人", score: 0 } ] },
      { q: "你信不信「命」——", options: [
        { text: "我命由我", score: 3 }, { text: "半信半疑", score: 1 },
        { text: "认命", score: 0 }, { text: "看情况", score: 2 } ] },
      { q: "你最怕哪种结局——", options: [
        { text: "平庸度过", score: 2 }, { text: "孤独终老", score: 0 },
        { text: "突然没了", score: 3 }, { text: "被人遗忘", score: 1 } ] },
      { q: "你做事的风格——", options: [
        { text: "风风火火", score: 3 }, { text: "稳扎稳打", score: 1 },
        { text: "拖到最后", score: 0 }, { text: "随性而为", score: 2 } ] },
      { q: "你觉得自己「作」吗——", options: [
        { text: "完全不作", score: 0 }, { text: "偶尔作", score: 2 },
        { text: "相当作", score: 3 }, { text: "别人觉得我作", score: 1 } ] },
      { q: "如果穿越，你最想——", options: [
        { text: "改写结局", score: 3 }, { text: "看热闹", score: 2 },
        { text: "安稳过日子", score: 0 }, { text: "搞点事业", score: 1 } ] }
    ],
    levels: [
      { min: 0,  label: "善终型 · 寿终正寝", analysis: "你上辈子大概率是安稳过完一生的人，没啥大波澜。今生的你也是求稳派，平安是福刻在骨子里。" },
      { min: 7,  label: "离奇型 · 好奇心害死", analysis: "你上辈子多半因为太爱凑热闹、啥都敢试而意外收场。今生的你依旧好奇心爆棚，记得别太莽。" },
      { min: 13, label: "情劫型 · 为爱所困", analysis: "你上辈子容易为情所困、为爱冲动。今生的你重感情但偶尔恋爱脑，桃花运和劫都挺旺。" },
      { min: 20, label: "热血型 · 冲锋陷阵", analysis: "你上辈子八成是当场面人、为兄弟为道义向前冲的主。今生的你仗义但容易吃亏，锋芒收一收更好。" },
      { min: 26, label: "戏剧型 · 轰轰烈烈", analysis: "你上辈子结局一定很戏剧——作天作地、大起大落。今生的你天生主角命，平淡反而待不住。" }
    ]
  },

  /* ============ 6. 你和哪个经典角色是灵魂 CP（level，算契合指数） ============ */
  {
    id: "cp",
    title: "你和哪个经典角色是灵魂 CP",
    intro: "从国民级角色里，找出和你灵魂最契合的那一位。10 题测出你的「灵魂契合指数」。",
    resultMode: "level",
    questions: [
      { q: "周末你更想——", options: [
        { text: "宅家追剧", score: 1 }, { text: "出门探险", score: 3 },
        { text: "约朋友聚会", score: 2 }, { text: "独自发呆", score: 0 } ] },
      { q: "面对不公，你——", options: [
        { text: "默默忍", score: 0 }, { text: "找人理论", score: 2 },
        { text: "硬刚到底", score: 3 }, { text: "找靠山", score: 1 } ] },
      { q: "你的最佳状态是——", options: [
        { text: "有人陪", score: 2 }, { text: "自由自在", score: 3 },
        { text: "被需要", score: 1 }, { text: "没人管我", score: 0 } ] },
      { q: "你吸引朋友的方式是——", options: [
        { text: "靠谱可靠", score: 1 }, { text: "幽默有趣", score: 2 },
        { text: "神秘高冷", score: 0 }, { text: "仗义豪爽", score: 3 } ] },
      { q: "你最受不了的人是——", options: [
        { text: "虚伪的", score: 2 }, { text: "束缚我的", score: 3 },
        { text: "出卖我的", score: 1 }, { text: "黏人的", score: 0 } ] },
      { q: "你的口头禅可能是——", options: [
        { text: "「随便」", score: 0 }, { text: "「走起」", score: 3 },
        { text: "「你说呢」", score: 2 }, { text: "「别烦我」", score: 1 } ] },
      { q: "你更认同哪种活法——", options: [
        { text: "安稳小日子", score: 1 }, { text: "浪迹天涯", score: 3 },
        { text: "左右逢源", score: 2 }, { text: "独善其身", score: 0 } ] },
      { q: "你给别人的第一印象——", options: [
        { text: "高冷", score: 0 }, { text: "暖心", score: 1 },
        { text: "热闹", score: 2 }, { text: "野性", score: 3 } ] },
      { q: "你最珍惜的东西是——", options: [
        { text: "自由", score: 3 }, { text: "情谊", score: 2 },
        { text: "信任", score: 1 }, { text: "清净", score: 0 } ] },
      { q: "如果组队，你愿意当——", options: [
        { text: "指挥", score: 2 }, { text: "先锋", score: 3 },
        { text: "辅助", score: 1 }, { text: "自由人", score: 0 } ] }
    ],
    levels: [
      { min: 0,  label: "独行侠型 · 契合指数低", analysis: "你灵魂里住着个不爱被管的独行者，和谁都保持距离。契合角色：逍遥派隐士。你的 CP 是「自由」本身。" },
      { min: 7,  label: "暖心伙伴型 · 中低", analysis: "你重情重义、让人安心，是团队里的可靠后盾。契合角色：忠犬系伙伴。谁跟你组队都踏实。" },
      { min: 13, label: "人气王型 · 中高", analysis: "你幽默热闹、左右逢源，走到哪都是气氛组。契合角色：机灵搞笑担当。你的 CP 是整支队伍的快乐。" },
      { min: 20, label: "先锋热血型 · 高", analysis: "你仗义、敢冲、自带主角光环，是天然的领导/先锋。契合角色：热血主角。你的 CP 是「一起闯」的兄弟。" },
      { min: 26, label: "灵魂野性型 · 满格", analysis: "你骨子里向往自由、不受束缚，野性难驯。契合角色：浪迹天涯的侠客。你的 CP 是远方和冒险。" }
    ]
  },

  /* ============ 7. 你是哪类新型摆烂（type 示例，自动识别） ============ */
  {
    id: "bailand",
    title: "你是哪类新型摆烂",
    intro: "摆烂也分流派。测测你属于哪一类「新型摆烂」，对症下药才能摆得优雅。",
    resultMode: "type",
    types: [
      { key: "A", label: "精致摆烂型", analysis: "你摆得很有格调：工作摸鱼但生活精致，头发护理、咖啡手冲一样不落。摆烂只是表象，舒服才是目的。", traits: ["表面精致", "内心躺平", "生活家"] },
      { key: "B", label: "战略性摆烂型", analysis: "你不真摆，只是挑重点躺：不重要的事一律糊弄，关键处才发力。这是高情商的资源分配。", traits: ["抓大放小", "省力气", "性价比大师"] },
      { key: "C", label: "间歇性起飞型", analysis: "平时躺如死猪，deadline 前爆发如神。你靠肾上腺素续命，心跳加速才是你的工作节奏。", traits: ["拖延", "爆发力", "心跳加速"] },
      { key: "D", label: "佛系养生型", analysis: "你连摆烂都摆得平和：钱多钱少开心就好，不卷不比。你的摆烂是一种人生智慧。", traits: ["平和", "边界感", "养生"] }
    ],
    questions: [
      { q: "周末闹钟——", options: [
        { text: "关掉，但护肤流程照做", scores: { A: 3, B: 0, C: 0, D: 0 } },
        { text: "关掉，能睡多晚多晚", scores: { A: 0, B: 0, C: 1, D: 2 } },
        { text: "设了但最后才起", scores: { A: 0, B: 1, C: 3, D: 0 } },
        { text: "根本不设，随缘", scores: { A: 0, B: 2, C: 0, D: 1 } } ] },
      { q: "领导布置杂活，你——", options: [
        { text: "精致地敷衍过去", scores: { A: 2, B: 1, C: 0, D: 0 } },
        { text: "判断重不重要再决定", scores: { A: 0, B: 3, C: 0, D: 0 } },
        { text: "先拖着再说", scores: { A: 0, B: 0, C: 3, D: 0 } },
        { text: "能做就做不做拉倒", scores: { A: 0, B: 0, C: 0, D: 3 } } ] },
      { q: "你的待办清单——", options: [
        { text: "精致排版但常不填", scores: { A: 3, B: 0, C: 0, D: 0 } },
        { text: "只列关键三件", scores: { A: 0, B: 3, C: 0, D: 0 } },
        { text: "deadline 前才列", scores: { A: 0, B: 0, C: 3, D: 0 } },
        { text: "脑里有就行", scores: { A: 0, B: 0, C: 0, D: 3 } } ] },
      { q: "看到别人卷，你——", options: [
        { text: "卷不动但我精致", scores: { A: 3, B: 0, C: 0, D: 0 } },
        { text: "算了，不卷", scores: { A: 0, B: 1, C: 0, D: 1 } },
        { text: "先躺，急了再卷", scores: { A: 0, B: 0, C: 3, D: 0 } },
        { text: "关我啥事", scores: { A: 0, B: 2, D: 2, C: 0 } } ] },
      { q: "你最在意什么——", options: [
        { text: "生活质感", scores: { A: 3, B: 0, C: 0, D: 1 } },
        { text: "效率性价比", scores: { A: 0, B: 3, C: 0, D: 0 } },
        { text: "别催我", scores: { A: 0, B: 0, C: 3, D: 0 } },
        { text: "身心舒坦", scores: { A: 1, B: 0, C: 0, D: 3 } } ] },
      { q: "你的朋友圈画风——", options: [
        { text: "精修生活美学", scores: { A: 3, B: 0, C: 0, D: 0 } },
        { text: "偶尔干货分享", scores: { A: 0, B: 3, C: 0, D: 0 } },
        { text: "深夜 emo 文学", scores: { A: 0, B: 0, C: 3, D: 0 } },
        { text: "几乎不发", scores: { A: 0, B: 1, C: 0, D: 2 } } ] },
      { q: "你如何描述自己——", options: [
        { text: "躺得漂亮", scores: { A: 3, B: 0, C: 0, D: 0 } },
        { text: "聪明地懒", scores: { A: 0, B: 3, C: 0, D: 0 } },
        { text: "Deadline 战神", scores: { A: 0, B: 0, C: 3, D: 0 } },
        { text: "随遇而安", scores: { A: 0, B: 0, C: 0, D: 3 } } ] },
      { q: "遇到难题，你优先——", options: [
        { text: "先美美喝杯咖啡", scores: { A: 3, B: 0, C: 0, D: 1 } },
        { text: "找最省力的解法", scores: { A: 0, B: 3, C: 0, D: 0 } },
        { text: "拖到最后一刻", scores: { A: 0, B: 0, C: 3, D: 0 } },
        { text: "顺其自然", scores: { A: 0, B: 0, C: 0, D: 3 } } ] },
      { q: "你对「成功」的看法——", options: [
        { text: "成功也要美美的", scores: { A: 3, B: 0, C: 0, D: 0 } },
        { text: "少干活多拿钱", scores: { A: 0, B: 3, C: 0, D: 0 } },
        { text: "逼急了也能成", scores: { A: 0, B: 0, C: 3, D: 0 } },
        { text: "健康快乐就行", scores: { A: 0, B: 0, C: 0, D: 3 } } ] },
      { q: "别人眼里的你——", options: [
        { text: "精致的懒人", scores: { A: 3, B: 0, C: 0, D: 0 } },
        { text: "看着闲实则稳", scores: { A: 0, B: 3, C: 0, D: 0 } },
        { text: " deadline 前消失", scores: { A: 0, B: 0, C: 3, D: 0 } },
        { text: "佛系本佛", scores: { A: 0, B: 0, C: 0, D: 3 } } ] }
    ]
  },

  /* ============ 8. 末日只能带一个人你带谁（level） ============ */
  {
    id: "doomsday",
    title: "末日只能带一个人你带谁",
    intro: "如果世界明天重启，背包只够带一个人——你的选择暴露了你的「生存人格」。",
    resultMode: "level",
    questions: [
      { q: "末日来临，你第一反应是——", options: [
        { text: "找家人汇合", score: 0 }, { text: "囤物资", score: 2 },
        { text: "找那个 TA", score: 1 }, { text: "先搞清楚状况", score: 3 } ] },
      { q: "你更看重同伴的——", options: [
        { text: "感情羁绊", score: 0 }, { text: "实用技能", score: 3 },
        { text: "陪伴感", score: 1 }, { text: "脑子好使", score: 2 } ] },
      { q: "危机中你扮演的角色——", options: [
        { text: "保护者", score: 0 }, { text: "指挥官", score: 3 },
        { text: "后勤", score: 2 }, { text: "跟随者", score: 1 } ] },
      { q: "你会为爱情放弃生存资源吗——", options: [
        { text: "会，没爱活不了", score: 0 }, { text: "看情况", score: 2 },
        { text: "不会，理智优先", score: 3 }, { text: "偷偷分一点", score: 1 } ] },
      { q: "你最怕末日里——", options: [
        { text: "孤独", score: 0 }, { text: "饿死", score: 3 },
        { text: "失控", score: 2 }, { text: "失去重要的人", score: 1 } ] },
      { q: "你对「信任」的态度——", options: [
        { text: "只信家人", score: 0 }, { text: "谁有用信谁", score: 3 },
        { text: "慢慢观察", score: 2 }, { text: "轻易交付", score: 1 } ] },
      { q: "你带的人更可能是——", options: [
        { text: "伴侣", score: 0 }, { text: "全能队友", score: 3 },
        { text: "死党", score: 1 }, { text: "家人", score: 2 } ] },
      { q: "末日里你最想守住——", options: [
        { text: "爱与羁绊", score: 0 }, { text: "活下去", score: 3 },
        { text: "尊严", score: 2 }, { text: "记忆", score: 1 } ] },
      { q: "你觉得自己能活到第几集——", options: [
        { text: "大结局", score: 3 }, { text: "中段", score: 2 },
        { text: "前两集", score: 1 }, { text: "开场就没了", score: 0 } ] },
      { q: "如果只能留一句话，你留给——", options: [
        { text: "爱的人", score: 0 }, { text: "全人类", score: 3 },
        { text: "兄弟", score: 1 }, { text: "未来的自己", score: 2 } ] }
    ],
    levels: [
      { min: 0,  label: "情深型 · 为爱续航", analysis: "末日里你第一个想带的是爱人/家人。你的人生锚点是情感羁绊，没有爱，末日也没意义。浪漫但危险。" },
      { min: 7,  label: "温情型 · 有人陪就行", analysis: "你不挑技能，只要身边有靠谱的伴。末日对你而言是「和谁一起」比「活多久」更重要。" },
      { min: 13, label: "务实型 · 聪明求生", analysis: "你会权衡该带谁最有利于活下去，感情让位给理智。末日生存排行榜里，你稳居中上游。" },
      { min: 20, label: "领袖型 · 指挥全局", analysis: "末日里你是那个定计划、分资源的人。你天然适合当队长，活到结局概率最高。" },
      { min: 26, label: "硬核型 · 独狼战神", analysis: "你带谁都不如自己能打。末日生存你是天选之子，一个人就是一支队伍。" }
    ]
  },

  /* ============ 9. 你是容易被哪种智商税收割的人（level） ============ */
  {
    id: "tax",
    title: "你是容易被哪种智商税收割的人",
    intro: "从盲盒到理财课，智商税无处不在。测测你最容易被哪一类「割韭菜」。",
    resultMode: "level",
    questions: [
      { q: "看到「限时秒杀」你——", options: [
        { text: "立刻下单", score: 3 }, { text: "看需求", score: 1 },
        { text: "「又套路」", score: 0 }, { text: "凑个热闹", score: 2 } ] },
      { q: "你买过「用一次就吃灰」的东西吗——", options: [
        { text: "一堆", score: 3 }, { text: "偶尔", score: 1 },
        { text: "几乎没有", score: 0 }, { text: "被送的", score: 2 } ] },
      { q: "面对「投资课程」，你——", options: [
        { text: "想报名学", score: 3 }, { text: "先观望", score: 1 },
        { text: "「割韭菜的」", score: 0 }, { text: "看看评价", score: 2 } ] },
      { q: "别人说「稳赚不赔」，你——", options: [
        { text: "有点心动", score: 3 }, { text: "半信半疑", score: 1 },
        { text: "直接拉黑", score: 0 }, { text: "问清楚逻辑", score: 2 } ] },
      { q: "你更可能为哪种买单——", options: [
        { text: "「网红同款」", score: 3 }, { text: "「专家推荐」", score: 2 },
        { text: "「朋友安利」", score: 1 }, { text: "「我自己研究过的」", score: 0 } ] },
      { q: "你对「免费送」的态度——", options: [
        { text: "先领了再说", score: 3 }, { text: "看看套路", score: 1 },
        { text: "「天上不掉馅饼」", score: 0 }, { text: "顺手领", score: 2 } ] },
      { q: "你过往「踩坑」频率——", options: [
        { text: "经常", score: 3 }, { text: "偶尔", score: 1 },
        { text: "极少", score: 0 }, { text: "记不清了", score: 2 } ] },
      { q: "你买东西前会做功课吗——", options: [
        { text: "基本不", score: 3 }, { text: "简单看看", score: 2 },
        { text: "认真比价", score: 0 }, { text: "看销量", score: 1 } ] },
      { q: "「焦虑营销」对你有用吗——", options: [
        { text: "很有用", score: 3 }, { text: "有点用", score: 2 },
        { text: "免疫", score: 0 }, { text: "看话题", score: 1 } ] },
      { q: "你觉得自己好骗吗——", options: [
        { text: "挺好骗", score: 3 }, { text: "看情况", score: 2 },
        { text: "不好骗", score: 0 }, { text: "别人觉得我好骗", score: 1 } ] }
    ],
    levels: [
      { min: 0,  label: "防割达人 · 刀枪不入", analysis: "你对营销套路高度免疫，下单前必做功课。智商税收割机在你这儿基本失业，请继续保持清醒。" },
      { min: 7,  label: "警觉型 · 偶尔翻车", analysis: "你大多数时候清醒，但遇到真痛点也会被戳中。属于「九防一漏」，再冷一点就无敌了。" },
      { min: 13, label: "易感型 · 半推半就", analysis: "你容易被氛围和销量带节奏，看到「大家都在买」就动摇。建议下单前睡一觉再决定。" },
      { min: 20, label: "高危型 · 一割一个准", analysis: "限时、免费、稳赚这些词对你杀伤力巨大，踩坑是常态。下次心动时先问自己：是不是又被安排了？" },
      { min: 26, label: "韭菜王 · 收割机最爱", analysis: "你是智商税商家的梦中情人，从盲盒到理财课来者不拒。醒醒，省钱才是真赚钱。" }
    ]
  },

  /* ============ 10. 你的电子木鱼修行段位（level） ============ */
  {
    id: "woodfish",
    title: "你的电子木鱼修行段位",
    intro: "敲电子木鱼、赛博积德——测测你在网络还愿文化里的修行段位。",
    resultMode: "level",
    questions: [
      { q: "你手机里有电子木鱼吗——", options: [
        { text: "天天敲", score: 3 }, { text: "装了偶尔", score: 2 },
        { text: "没装但见过", score: 1 }, { text: "啥是木鱼", score: 0 } ] },
      { q: "敲木鱼的心态是——", options: [
        { text: "积德祈福", score: 3 }, { text: "解压好玩", score: 2 },
        { text: "跟风凑热闹", score: 1 }, { text: "不理解", score: 0 } ] },
      { q: "你更常「赛博上香」还是「赛博敲鱼」——", options: [
        { text: "木鱼党", score: 3 }, { text: "都来点", score: 2 },
        { text: "上香党", score: 1 }, { text: "都不", score: 0 } ] },
      { q: "遇到倒霉事，你——", options: [
        { text: "敲鱼消灾", score: 3 }, { text: "吐槽完算了", score: 2 },
        { text: "自认倒霉", score: 1 }, { text: "不信这些", score: 0 } ] },
      { q: "你为「虚拟功德」花过钱吗——", options: [
        { text: "花过", score: 3 }, { text: "想花没花", score: 2 },
        { text: "白嫖", score: 1 }, { text: "不会", score: 0 } ] },
      { q: "你觉得赛博修行——", options: [
        { text: "挺治愈", score: 3 }, { text: "图一乐", score: 2 },
        { text: "有点无聊", score: 1 }, { text: "纯属玄学", score: 0 } ] },
      { q: "你会在评论区「云敲鱼」吗——", options: [
        { text: "经常", score: 3 }, { text: "偶尔", score: 2 },
        { text: "只看不敲", score: 1 }, { text: "从不", score: 0 } ] },
      { q: "你的修行动力来自——", options: [
        { text: "真想转运", score: 3 }, { text: "缓解焦虑", score: 2 },
        { text: "社交梗", score: 1 }, { text: "无", score: 0 } ] },
      { q: "你向朋友安利过电子木鱼吗——", options: [
        { text: "安利过", score: 3 }, { text: "提过一嘴", score: 2 },
        { text: "没提", score: 1 }, { text: "不会", score: 0 } ] },
      { q: "你觉得自己功德——", options: [
        { text: "已满", score: 3 }, { text: "还在攒", score: 2 },
        { text: "一点点", score: 1 }, { text: "为零", score: 0 } ] }
    ],
    levels: [
      { min: 0,  label: "凡人小白 · 段位 0", analysis: "你对电子木鱼一脸懵，赛博修行的大门还没推开。也挺好，少一份执念多一份清净。" },
      { min: 7,  label: "入门香客 · 段位 1", analysis: "你偶尔敲两下图个乐，对赛博修行持开放态度。属于「信则有，不信则看戏」的轻松派。" },
      { min: 13, label: "资深居士 · 段位 2", analysis: "你已把敲木鱼当日常解压，功德+1 是真能让你松口气。赛博修行，修的是心态。" },
      { min: 20, label: "木鱼大师 · 段位 3", analysis: "电子木鱼是你手机常驻 App，遇事就敲、逢帖云敲。你的功德簿估计已经翻了好几页。" },
      { min: 26, label: "赛博活佛 · 段位满", analysis: "你是赛博修行界的扛把子，功德拉满、段位封顶。建议开坛讲经，普渡同为打工人的众生。" }
    ]
  }

];
