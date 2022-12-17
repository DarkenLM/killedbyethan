let listData = undefined;
let typeIds = undefined

window.addEventListener("load", async function () {
	listData = await getListData();
	renderList(listData);

	const types = Object.entries(groupBy(listData, "type")).map(([key,value]) => ({ name: key, count: value.length }));
	types.unshift({ name: "all", count: listData.length })

	typeIds = types.map(t => t.name);
	
	makeFilterDropdown(listData, types);



	const searchBox = document.getElementById("searchBox");
	searchBox.addEventListener("keyup", function() {
		const filter = searchBox.value;
		const selectedType = typeIds[optSelected.dataset.selected];

		if (filter === "") return renderList(listData);

		const elems = listData.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()) && validType(selectedType, e.type));
		renderList(elems);
	})

	jump(decodeURIComponent(window.location.hash).replace("#", "").replace(/ /g, "_"))
})

async function getListData() {
	return new Promise((resolve, reject) => {
		fetch("the_list.json")
		.then(response => response.json())
		.then(data => {
			resolve(data);
		});
	})
}

/** @typedef { {dateClose: string, description: string, link string, name: string, type: string} } Elem */

/**
 * @param {Elem} elem
 */
function makeListElem(elem) {
	return `
<li class="css-h0240q e1hf78cm2">
	<div class="css-1ew1k0h e1hf78cm3">
		<img src="assets/svg/guillotine.svg" alt="Guillotine" class="css-7f50zt e1hf78cm4">
		<div class="css-6plnry e1hf78cm1">
			<time datetime="${elem.dateClose}">${dayjs(elem.dateClose).format("MMMM")}<br>${dayjs(elem.dateClose).format("YYYY")}</time>
		</div>
		<span style="padding: 0.25rem; display: inline-block; background-color: rgb(224, 224, 224); border-radius: 0.25rem; margin-top: 0.3rem; color: gray; font-size: 0.7em; text-transform: capitalize;">${elem.type}</span>
	</div>
	<div class="css-1nov6qy e1hf78cm0">
		<h2>
			<a 
				href="#${elem.name.replace(/ /g, "_")}" 
				id="${elem.name.replace(/ /g, "_")}"
				>
				${elem.name}
			</a>
		</h2>
		<p class="css-1v6fukt e1hf78cm5">
			<span>${elem.description}</p>
	</div>
</li>
`
}

/**
 * @param {Elem[]} elems
 */
function makeList(elems) {
	return elems.map(makeListElem).join("\n")
}

const listElem = document.getElementById("ded_list");
function renderList(data) {
	const list = makeList(data)

	listElem.innerHTML = list;
}

const optSelected = document.getElementById("sfo-selected");
const optSelectedLabel = document.getElementById("sfo-selected-label");
const optList = document.getElementById("sfo-list");
const optListElems = document.getElementById("sfo-list-elems");

/**
 * @param {Event} e
 */
function OSClick(e) {
	if (!optSelected.hasAttribute("open")) optSelected.setAttribute("open", "false")

	let open = optSelected.getAttribute("open")
	if (!getAllParents(e.target).some(e => e === optSelected)) open = "true";

	if (open === "true") {
		optList.style.display = "none";
	} else {
		optList.style.display = "block";
	}

	optSelected.setAttribute("open", `${open === "false"}`)
}

function OLOClick(e) {
	optSelected.dataset.selected = e.target.id.split("-").at(-1);
	optSelectedLabel.innerText = e.target.innerText;
	optSelected.click();

	const filter = searchBox.value;
	const selectedType = typeIds[optSelected.dataset.selected];
	const elems = listData.filter(e => e.name.toLowerCase().includes(filter.toLowerCase()) && validType(selectedType, e.type));
	renderList(elems);
}

function makeFilterDropdown(elems, types) {
	optSelected.removeEventListener("click", OSClick);
	optSelected.addEventListener("click", OSClick);

	const baseOpt = `<div class="css-yt9ioa-option" aria-disabled="false" id="sfo-{NUM}" name="select-filter-option" tabindex="-1">{NAME}</div>`
	const list = [
		//baseOpt.replace("{NUM}", 0).replace("{NAME}", `All (${types[0].count || 0})`)
	];

	for (let i = 0; i < types.length; i++) {
		const type = types[i];
		list.push(baseOpt.replace("{NUM}", i).replace("{NAME}", `${capitalizeFirstLetter(type.name)} (${type.count})`));
	}
	
	optListElems.innerHTML = list.join("\n");
	optSelectedLabel.innerText = document.getElementById(`sfo-0`).innerText;

	document.querySelectorAll(`[id^='sfo-']`).forEach(e => e.removeEventListener("click", OLOClick))
	for (let i = 0; i < types.length; i++) {
		const opt = document.getElementById(`sfo-${i}`)

		opt.addEventListener("click", OLOClick)
	}
}

/*
	UTILS
*/

function groupBy(xs, key) {
	return xs.reduce(function(rv, x) {
		(rv[x[key]] = rv[x[key]] || []).push(x);
		return rv;
	}, {});
};

function getAllParents(elem) {
	let a = elem;
	let els = [];

	while (a) {
		els.unshift(a);
		a = a.parentNode;
	}

	return els;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

const validType = (st, t) => st === "all" ? true : st === t

function jump(h){
    let url = location.href;                 //Save down the URL without hash.
    location.href = "#" + h;                 //Go to the target element.
    history.replaceState(null,null,url);     //Don't like hashes. Changing it back.
}

function removeHash () { 
    history.pushState("", document.title, window.location.pathname + window.location.search);
}
