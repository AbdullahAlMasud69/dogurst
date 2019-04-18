const diamond = (data, numb) => {
	let add = 1
	if (numb > 1) {
		add = Math.floor(numb / 1.5)
	}
	for (let i = 0; i < add; i++) {
		data.inventory.push('11')
	}
	return data
}

const clone = (data) => {
	data.inventory.push('10')
	return data
}

const superShield = (data) => {
	data.inventory.push('12')
	return data
}

const syringe = (data) => {
	data.inventory.push('13')
	return data
}

const money = (data, numb) => {
	data.money += 1000 * numb
	return data
}

const xp = (data, numb) => {
	data.xp += 115 * (numb + 1)
	return data
}

const troops = (data, numb) => {
	data.troops += numb + 2
	return data
}

const superTroops = (data, numb) => {
	data.troops += 3
	data.troops += numb * 2
	return data
}

const base = async (ctx) => {
	const presents = [
		money,
		xp,
		troops,
		troops,
		diamond,
		superShield,
		superShield,
		clone,
		syringe,
		syringe,
		superTroops
	]

	const quest = ctx.quest.check('present', ctx)
	if (quest) {
		presents.push(quest)
	}

	const i18nPresents = {
		money: ctx._('Money'),
		xp: ctx._('XP'),
		troops: ctx._('Troops'),
		superTroops: ctx._('SuperTroops'),
		diamond: ctx._('Diamond'),
		superShield: ctx._('SuperShield'),
		clone: ctx._('Clone'),
		quest: ctx._('Quest'),
		syringe: ctx._('Syringe')
	}

	const text = ctx._`
<b>🎁 Present</b>
${ctx.tips(ctx)}`
	const date = new Date()
	let boxs = []
	if (ctx.session.box < +date) {
		if (ctx.match[2]) {
			date.setDate(date.getDate() + 1)
			ctx.session.box = +date
			let present = presents[Math.floor((Math.random() * presents.length))]
			if (present.name == 'Quest' && ctx.session.quest) {
				present = Diamond
			}

			const data = present(
				ctx.db,
				Math.floor(Math.random() * (6 - 1) + 1), //Range: 1-5
				ctx
			)

			if (data) { //No bug :)
				ctx.db = data
			}
			await ctx.database.saveUser(ctx)
			if (ctx.db[present.name]) {
				ctx.answerCbQuery(ctx._`
	Present(${i18nPresents[present.name]}): +${ctx.db[present.name] - ctx.db.old[present.name]}
				`, true)
			} else {
				ctx.answerCbQuery(ctx._`Present: ${i18nPresents[present.name]}!`, true)
			}

		} else {
			boxs = [
				[
					{text: `🎁` , callback_data: 'box:1' },
					{text: `🎁` , callback_data: 'box:2' },
					{text: `🎁` , callback_data: 'box:3' }
				]
			]
		}
	}
	const keyboard = [
		...boxs,
		[{text: ctx._`📜 Menu`, callback_data: 'menu:main' }]
	]

	return ctx.editMessageText(text + ctx.fixKeyboard, {
		parse_mode: 'HTML',
		reply_markup: {
			inline_keyboard: keyboard
		},
		disable_web_page_preview: true
	})
}

module.exports = {
	id: 'box',
	callback: base
}
