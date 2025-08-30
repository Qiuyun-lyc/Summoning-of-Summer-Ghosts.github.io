export default class SentencePrinter {
	constructor (element) {
		this.element = element;
		this.wps = 50; // 打字机效果延迟
		this.ptr = 0;
		this.text = null;
		this.intervalId = null;
	}

	startInterval() {
		this.stopInterval();
		this.intervalId = setInterval(()=> {
			this.putNextChar();
		}, this.wps);
	}

	stopInterval() {
		if (this.intervalId) {
			clearInterval(this.intervalId);
			this.intervalId = null;
		}
	}

	hasFinished() {
		if (!this.text) return true;
		return this.ptr >= this.text.length;
	}

	putNextChar() {
		if (this.hasFinished()) {
			this.stopInterval();
			return false;
		}
		this.element.textContent += this.text[this.ptr];
		this.ptr++;
		return true;
	}

	print(textToPrint) {
		this.text = textToPrint;
		this.element.textContent = '';
		this.ptr = 0;
		this.startInterval();
	}

	skip() {
        this.stopInterval();
		if (this.text) {
		    this.element.textContent = this.text;
            this.ptr = this.text.length;
        }
	}
}