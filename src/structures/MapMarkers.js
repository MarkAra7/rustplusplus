/*
    Copyright (C) 2022 Alexander Emanuelsson (alexemanuelol)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.

    https://github.com/alexemanuelol/rustplusplus

*/

const Map = require('../util/map.js');

class MapMarkers {
    constructor(mapMarkers, rustplus, client) {
        this._markers = mapMarkers.markers;

        this._rustplus = rustplus;
        this._client = client;

        this._types = {
            Player: 1
        }

        this._players = [];

        this.updateMapMarkers(mapMarkers);
    }

    /* Getters and Setters */
    get markers() { return this._markers; }
    set markers(markers) { this._markers = markers; }
    get rustplus() { return this._rustplus; }
    set rustplus(rustplus) { this._rustplus = rustplus; }
    get client() { return this._client; }
    set client(client) { this._client = client; }
    get types() { return this._types; }
    set types(types) { this._types = types; }
    get players() { return this._players; }
    set players(players) { this._players = players; }

    getType(type) {
        if (!Object.values(this.types).includes(type)) {
            return null;
        }

        switch (type) {
            case this.types.Player: {
                return this.players;
            } break;

            default: {
                return null;
            } break;
        }
    }

    getMarkersOfType(type, markers) {
        if (!Object.values(this.types).includes(type)) {
            return [];
        }

        let markersOfType = [];
        for (let marker of markers) {
            if (marker.type === type) {
                markersOfType.push(marker);
            }
        }

        return markersOfType;
    }

    getMarkerByTypeId(type, id) {
        return this.getType(type).find(e => e.id === id);
    }

    isMarkerPresentByTypeId(type, id, markers = null) {
        if (markers) {
            return markers.some(e => e.id === id);
        }
        else {
            return this.getType(type).some(e => e.id === id);
        }
    }

    getNewMarkersOfTypeId(type, markers) {
        let newMarkersOfType = [];

        for (let marker of this.getMarkersOfType(type, markers)) {
            if (!this.isMarkerPresentByTypeId(type, marker.id)) {
                newMarkersOfType.push(marker);
            }
        }

        return newMarkersOfType
    }

    getLeftMarkersOfTypeId(type, markers) {
        let leftMarkersOfType = this.getType(type).slice();

        for (let marker of this.getMarkersOfType(type, markers)) {
            if (this.isMarkerPresentByTypeId(type, marker.id)) {
                leftMarkersOfType = leftMarkersOfType.filter(e => e.id !== marker.id);
            }
        }

        return leftMarkersOfType;
    }

    getRemainingMarkersOfTypeId(type, markers) {
        let remainingMarkersOfType = [];

        for (let marker of markers) {
            if (this.isMarkerPresentByTypeId(type, marker.id)) {
                remainingMarkersOfType.push(marker);
            }
        }

        return remainingMarkersOfType;
    }




    /* Update event map markers */

    updateMapMarkers(mapMarkers) {
        this.updatePlayers(mapMarkers);
    }

    updatePlayers(mapMarkers) {
        let newMarkers = this.getNewMarkersOfTypeId(this.types.Player, mapMarkers.markers);
        let leftMarkers = this.getLeftMarkersOfTypeId(this.types.Player, mapMarkers.markers);
        let remainingMarkers = this.getRemainingMarkersOfTypeId(this.types.Player, mapMarkers.markers);

        /* Player markers that are new. */
        for (let marker of newMarkers) {
            let mapSize = this.rustplus.info.correctedMapSize;
            let pos = Map.getPos(marker.x, marker.y, mapSize, this.rustplus);

            marker.location = pos;

            this.players.push(marker);
        }

        /* Player markers that have left. */
        for (let marker of leftMarkers) {
            this.players = this.players.filter(e => e.id !== marker.id);
        }

        /* Player markers that still remains. */
        for (let marker of remainingMarkers) {
            let mapSize = this.rustplus.info.correctedMapSize;
            let pos = Map.getPos(marker.x, marker.y, mapSize, this.rustplus);
            let player = this.getMarkerByTypeId(this.types.Player, marker.id);

            player.x = marker.x;
            player.y = marker.y;
            player.location = pos;
        }
    }

    reset() {
        this.players = [];
    }
}

module.exports = MapMarkers;