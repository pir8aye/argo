import { Hyper } from "../../util";
import { QuotesService } from "../quotes/quotes.service";
import { SlChartTemplate } from "./sl-chart.template";

class SlChartElement extends Hyper {
    static get observedAttributes() {
        return ["data-quote"];
    }

    constructor() {
        super();

        SlChartElement.state = {
            instrument: this.dataset.instrument,
            quotes: QuotesService.getQuotes(),
            length: 100
        };
    }

    render() {
        return SlChartTemplate.update(this.hyper);
    }

    attributeChangedCallback(attr, oldValue, newValue) {
        this.dummy = "dummy";

        SlChartElement.state.instrument = JSON.parse(newValue).instrument;

        SlChartTemplate.redraw(SlChartElement.state);
    }

}
customElements.define("sl-chart", SlChartElement);

SlChartElement.state = null;
