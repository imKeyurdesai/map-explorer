import React, { useState, useEffect, useRef } from "react";
import { Button } from "./components/ui/button";
import { ModeToggle } from "./components/mode-toggle";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import mapboxgl from "mapbox-gl";

function App() {
  const [country, setCountry] = useState([]);

  // const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");
  const [selectcountry, setselectcountry] = useState(null);
  const [accordionValue, setAccordionValue] = useState(undefined);

  const handle_submit = async (val: string) => {
    try {
      // setLoading(true);
      if (val.trim().length !== 0) {
        await fetch(`https://restcountries.com/v3.1/name/${val}`)
          .then((response) => response.json())
          .then((data) => {
            if (data.status == 404) {
              setCountry([]);
            } else {
              setCountry(data);
              update_data(data);
            }
          });
      }
      // setLoading(false);
    } catch (error) {
      console.error(error);
    }
  };

  const update_data = async (city: string) => {
    setselectcountry(country.find((ele) => ele.name.common === city));
  };

  //map starts here
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  // Initialize map ONCE on mount
  useEffect(() => {
    mapboxgl.accessToken =
      "pk.eyJ1Ijoibm92YWJpbDQ2NiIsImEiOiJjbGdnaDk5OWgwM2IzM2RwN3dhZW9tYXdrIn0.3ECgUtQ0bqNsbKe1ctDmIw";

    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/standard",
      center: [20, 47],
      zoom: 3,
    });
    return () => mapRef.current?.remove();
  }, []);

  useEffect(() => {
    if (!mapRef.current || !selectcountry?.latlng) return;
    const [lat, lng] = selectcountry.latlng;
    mapRef.current.flyTo({
      center: [lng, lat],
      zoom: 5,
      essential: true,
    });

    setAccordionValue("info");

    // mapRef.current.addSource("mapbox-dem", {
    //   type: "raster-dem",
    //   url: "mapbox://mapbox.mapbox-terrain-dem-v1",
    //   tileSize: 512,
    //   maxzoom: 14,
    // });

    // mapRef.current.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

    // mapRef.current.getTerrain();
  }, [selectcountry]);

  return (
    <>
      <div className="absolute m-5 z-10">
        <ModeToggle />
      </div>
      <div>
        <section className="flex justify-center items-center">
          <div className="absolute z-100 top-10 p-2 rounded-2xl">
            <div className="flex w-full max-w-sm items-center gap-2">
              <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="w-50 justify-between backdrop-blur-lg p-5 text-black border-2 border-neutral-500 hover:text-neutral-700"
                  >
                    {value
                      ? country.find((Country) => Country.name.common === value)
                          ?.name?.common
                      : "Select Country..."}
                    <ChevronsUpDown className="opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-50 p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search Country..."
                      className="h-9"
                      onValueChange={(val) => {
                        handle_submit(val);
                      }}
                    />
                    <CommandList>
                      <CommandEmpty>No Country found.</CommandEmpty>
                      <CommandGroup>
                        {country?.map((Country) => (
                          <CommandItem
                            key={Country.name.common}
                            value={Country.name.common}
                            onSelect={(currentValue) => {
                              setValue(
                                currentValue === value ? "" : currentValue
                              );
                              setOpen(false);
                              update_data(currentValue);
                            }}
                          >
                            {Country.name.common}
                            <Check
                              className={cn(
                                "ml-auto",
                                value === Country.name.common
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </section>
        <div className="relative w-full h-screen z-0">
          <div ref={mapContainerRef} id="map" style={{ height: "100%" }} />
        </div>
      </div>
      <div className="absolute top-30 right-20">
        <Accordion
          className="backdrop-blur-3xl"
          type="single"
          collapsible
          value={accordionValue}
          onValueChange={setAccordionValue}
        >
          <AccordionItem value="info">
            <AccordionTrigger className="bold text-3xl mb-3">
              More About Country
            </AccordionTrigger>
            <AccordionContent className="h-full">
              {selectcountry ? (
                <section className="max-w-60">
                  <div className="text-2xl flex gap-2 items-center">
                    <img
                      className="h-5 "
                      src={selectcountry.flags.svg}
                      alt={selectcountry.name.official}
                    />{" "}
                    {selectcountry.name.common}
                  </div>
                  <div className="text-xl">
                    Capital : {selectcountry.capital}
                  </div>
                  <div className="text-xl">
                    Continent : {selectcountry.region}
                  </div>
                  <div className="text-xl">
                    Population : {selectcountry.population}
                  </div>
                  <div className="text-xl">
                    <div>latitude : {selectcountry.latlng[0]}</div>
                    <div>longitude: {selectcountry.latlng[1]}</div>
                  </div>
                </section>
              ) : (
                <div>Select A Country First</div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </>
  );
}

export default App;
