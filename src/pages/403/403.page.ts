import { LitElement, html } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("not-authorized-page")
export class NotAuthorized extends LitElement {
    render() {
        return html`
            <h1>Not Authorized</h1>
        `;
    }
}